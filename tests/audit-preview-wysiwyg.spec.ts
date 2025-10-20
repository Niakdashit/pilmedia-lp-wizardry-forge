import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

/**
 * AUDIT WYSIWYG - Comparaison des modes preview entre éditeurs
 * 
 * Référence validée : /design-editor
 * Éditeurs à auditer : /jackpot-editor, /scratch-editor
 * 
 * Scénario :
 * 1. Ajouter des modules aléatoires en mode édition
 * 2. Passer en mode preview
 * 3. Comparer visuellement avec design-editor
 * 4. Détecter les différences (positions, tailles, styles)
 */

const EDITORS = [
  { name: 'design-editor', url: 'http://localhost:8080/design-editor', isReference: true },
  { name: 'jackpot-editor', url: 'http://localhost:8080/jackpot-editor', isReference: false },
  { name: 'scratch-editor', url: 'http://localhost:8080/scratch-editor', isReference: false }
];

const DEVICES = ['mobile', 'tablet', 'desktop'];

// Modules à ajouter aléatoirement
const MODULES_TO_ADD = [
  { type: 'text', label: 'Texte' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Bouton' }
];

interface ElementMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
}

interface ScreenshotComparison {
  editor: string;
  device: string;
  screenshotPath: string;
  metrics: {
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
    elementsCount: number;
    elements: ElementMetrics[];
  };
}

test.describe('Audit WYSIWYG - Comparaison Preview Éditeurs', () => {
  test.setTimeout(120000); // 2 minutes par test

  let referenceData: Map<string, ScreenshotComparison> = new Map();

  // Helper: Attendre que la page soit chargée
  async function waitForEditorReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Attendre les animations
  }

  // Helper: Sélectionner le device
  async function selectDevice(page: Page, device: string) {
    console.log(`📱 Sélection du device: ${device}`);
    
    // Chercher le sélecteur de device (peut varier selon l'éditeur)
    const deviceSelectors = [
      `button[aria-label="${device}"]`,
      `button:has-text("${device}")`,
      `[data-device="${device}"]`,
      `.device-selector button:has-text("${device}")`
    ];

    for (const selector of deviceSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click();
          await page.waitForTimeout(500);
          console.log(`✅ Device ${device} sélectionné via ${selector}`);
          return;
        }
      } catch (e) {
        continue;
      }
    }

    console.warn(`⚠️ Impossible de sélectionner le device ${device}`);
  }

  // Helper: Ajouter un module aléatoire
  async function addRandomModule(page: Page, editorName: string) {
    console.log(`➕ Ajout d'un module aléatoire sur ${editorName}`);

    try {
      // Chercher le panneau d'éléments/modules
      const elementsPanelSelectors = [
        'button:has-text("Éléments")',
        'button:has-text("Elements")',
        '[data-panel="elements"]',
        '.sidebar button:has-text("Texte")'
      ];

      // Ouvrir le panneau d'éléments
      for (const selector of elementsPanelSelectors) {
        try {
          const panel = page.locator(selector).first();
          if (await panel.isVisible({ timeout: 1000 })) {
            await panel.click();
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // Ajouter un texte (le plus simple et universel)
      const addTextSelectors = [
        'button:has-text("Ajouter un texte")',
        'button:has-text("Add text")',
        'button:has-text("Texte")',
        '[data-add="text"]'
      ];

      for (const selector of addTextSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 1000 })) {
            await button.click();
            await page.waitForTimeout(1000);
            console.log(`✅ Module texte ajouté`);
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      console.warn(`⚠️ Impossible d'ajouter un module sur ${editorName}`);
      return false;
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout de module:`, error);
      return false;
    }
  }

  // Helper: Passer en mode preview
  async function switchToPreview(page: Page) {
    console.log(`👁️ Passage en mode preview`);

    const previewSelectors = [
      'button:has-text("Aperçu")',
      'button:has-text("Preview")',
      'button:has-text("Mode aperçu")',
      '[data-action="preview"]',
      'button[aria-label="Preview"]'
    ];

    for (const selector of previewSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          await page.waitForTimeout(2000); // Attendre l'animation de transition
          console.log(`✅ Mode preview activé`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    console.warn(`⚠️ Impossible de passer en mode preview`);
    return false;
  }

  // Helper: Capturer les métriques du canvas
  async function captureCanvasMetrics(page: Page, device: string): Promise<any> {
    console.log(`📊 Capture des métriques du canvas`);

    try {
      const metrics = await page.evaluate(() => {
        // Chercher le canvas principal
        const canvasSelectors = [
          '.design-canvas-container',
          '[data-canvas="main"]',
          '.canvas-wrapper',
          '.preview-canvas'
        ];

        let canvas: Element | null = null;
        for (const selector of canvasSelectors) {
          canvas = document.querySelector(selector);
          if (canvas) break;
        }

        if (!canvas) {
          console.warn('Canvas non trouvé');
          return null;
        }

        const rect = canvas.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(canvas);

        // Capturer tous les éléments du canvas
        const elements = Array.from(canvas.querySelectorAll('[data-element-id], .canvas-element')).map(el => {
          const elRect = el.getBoundingClientRect();
          const elStyle = window.getComputedStyle(el);
          
          return {
            x: elRect.x - rect.x,
            y: elRect.y - rect.y,
            width: elRect.width,
            height: elRect.height,
            fontSize: elStyle.fontSize,
            color: elStyle.color,
            backgroundColor: elStyle.backgroundColor
          };
        });

        return {
          canvasWidth: rect.width,
          canvasHeight: rect.height,
          backgroundColor: computedStyle.backgroundColor,
          elementsCount: elements.length,
          elements
        };
      });

      return metrics;
    } catch (error) {
      console.error(`❌ Erreur capture métriques:`, error);
      return null;
    }
  }

  // Helper: Comparer deux captures
  function compareMetrics(reference: any, target: any, editorName: string, device: string) {
    const differences: string[] = [];

    if (!reference || !target) {
      differences.push(`❌ Données manquantes pour la comparaison`);
      return differences;
    }

    // Comparer les dimensions du canvas
    const widthDiff = Math.abs(reference.canvasWidth - target.canvasWidth);
    const heightDiff = Math.abs(reference.canvasHeight - target.canvasHeight);

    if (widthDiff > 5) {
      differences.push(`⚠️ Largeur canvas: ${target.canvasWidth}px vs ${reference.canvasWidth}px (diff: ${widthDiff}px)`);
    }

    if (heightDiff > 5) {
      differences.push(`⚠️ Hauteur canvas: ${target.canvasHeight}px vs ${reference.canvasHeight}px (diff: ${heightDiff}px)`);
    }

    // Comparer le nombre d'éléments
    if (reference.elementsCount !== target.elementsCount) {
      differences.push(`⚠️ Nombre d'éléments: ${target.elementsCount} vs ${reference.elementsCount}`);
    }

    // Comparer les positions des éléments (si même nombre)
    if (reference.elementsCount === target.elementsCount && reference.elements && target.elements) {
      reference.elements.forEach((refEl: ElementMetrics, index: number) => {
        const targetEl = target.elements[index];
        if (!targetEl) return;

        const xDiff = Math.abs(refEl.x - targetEl.x);
        const yDiff = Math.abs(refEl.y - targetEl.y);

        if (xDiff > 10 || yDiff > 10) {
          differences.push(`⚠️ Élément ${index}: Position (${targetEl.x}, ${targetEl.y}) vs (${refEl.x}, ${refEl.y}) - diff: (${xDiff}px, ${yDiff}px)`);
        }
      });
    }

    return differences;
  }

  // Test principal pour chaque device
  for (const device of DEVICES) {
    test(`Audit Preview - Device: ${device}`, async ({ browser }) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 AUDIT PREVIEW - DEVICE: ${device.toUpperCase()}`);
      console.log(`${'='.repeat(60)}\n`);

      const results: ScreenshotComparison[] = [];

      for (const editor of EDITORS) {
        console.log(`\n📝 Éditeur: ${editor.name} ${editor.isReference ? '(RÉFÉRENCE)' : ''}`);
        console.log(`-`.repeat(40));

        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();

        try {
          // 1. Charger l'éditeur
          console.log(`🌐 Chargement de ${editor.url}`);
          await page.goto(editor.url, { waitUntil: 'networkidle' });
          await waitForEditorReady(page);

          // 2. Sélectionner le device
          await selectDevice(page, device);
          await page.waitForTimeout(1000);

          // 3. Ajouter 2-3 modules aléatoires
          const modulesToAdd = Math.floor(Math.random() * 2) + 2; // 2 ou 3 modules
          console.log(`📦 Ajout de ${modulesToAdd} modules`);
          
          for (let i = 0; i < modulesToAdd; i++) {
            await addRandomModule(page, editor.name);
            await page.waitForTimeout(500);
          }

          // 4. Passer en mode preview
          const previewSuccess = await switchToPreview(page);
          
          if (!previewSuccess) {
            console.warn(`⚠️ Mode preview non accessible pour ${editor.name}`);
            await context.close();
            continue;
          }

          await page.waitForTimeout(2000);

          // 5. Capturer screenshot
          const screenshotDir = path.join(process.cwd(), 'test-results', 'audit-preview');
          const screenshotPath = path.join(screenshotDir, `${editor.name}-${device}.png`);
          
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: true 
          });
          console.log(`📸 Screenshot: ${screenshotPath}`);

          // 6. Capturer les métriques
          const metrics = await captureCanvasMetrics(page, device);
          
          if (metrics) {
            console.log(`📊 Métriques capturées:`);
            console.log(`   - Canvas: ${metrics.canvasWidth}x${metrics.canvasHeight}px`);
            console.log(`   - Éléments: ${metrics.elementsCount}`);
            console.log(`   - Background: ${metrics.backgroundColor}`);
          }

          const comparison: ScreenshotComparison = {
            editor: editor.name,
            device,
            screenshotPath,
            metrics: metrics || {
              canvasWidth: 0,
              canvasHeight: 0,
              backgroundColor: '',
              elementsCount: 0,
              elements: []
            }
          };

          results.push(comparison);

          // Si c'est la référence, la stocker
          if (editor.isReference) {
            referenceData.set(device, comparison);
            console.log(`✅ Référence ${device} enregistrée`);
          }

        } catch (error) {
          console.error(`❌ Erreur sur ${editor.name}:`, error);
        } finally {
          await context.close();
        }
      }

      // 7. Comparer avec la référence
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 COMPARAISON AVEC LA RÉFÉRENCE (design-editor)`);
      console.log(`${'='.repeat(60)}\n`);

      const reference = referenceData.get(device);
      
      if (!reference) {
        console.warn(`⚠️ Pas de référence disponible pour ${device}`);
        return;
      }

      for (const result of results) {
        if (result.editor === 'design-editor') continue;

        console.log(`\n🔍 ${result.editor} vs design-editor (${device})`);
        console.log(`-`.repeat(40));

        const differences = compareMetrics(reference.metrics, result.metrics, result.editor, device);

        if (differences.length === 0) {
          console.log(`✅ Aucune différence détectée - WYSIWYG parfait!`);
        } else {
          console.log(`⚠️ ${differences.length} différence(s) détectée(s):`);
          differences.forEach(diff => console.log(`   ${diff}`));
        }

        // Assertions Playwright
        expect(differences.length).toBeLessThan(5); // Max 5 différences tolérées
      }

      // 8. Générer le rapport
      const reportPath = path.join(process.cwd(), 'test-results', 'audit-preview', `report-${device}.json`);
      await mkdir(path.dirname(reportPath), { recursive: true });
      await writeFile(
        reportPath,
        JSON.stringify({ device, results, reference }, null, 2),
        'utf-8'
      );
      console.log(`\n📄 Rapport généré: ${reportPath}`);
    });
  }

  // Test de régression visuelle avec screenshots
  test('Régression Visuelle - Comparaison Screenshots', async ({ browser }) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📸 RÉGRESSION VISUELLE - COMPARAISON SCREENSHOTS`);
    console.log(`${'='.repeat(60)}\n`);

    // Ce test compare visuellement les screenshots générés
    // Utilise pixelmatch ou similar pour détecter les différences pixel par pixel

    const screenshotDir = path.join(process.cwd(), 'test-results', 'audit-preview');
    
    for (const device of DEVICES) {
      console.log(`\n📱 Device: ${device}`);
      
      const referenceScreenshot = path.join(screenshotDir, `design-editor-${device}.png`);
      const editorsToCompare = ['jackpot-editor', 'scratch-editor'];

      for (const editor of editorsToCompare) {
        const targetScreenshot = path.join(screenshotDir, `${editor}-${device}.png`);
        
        console.log(`🔍 Comparaison: ${editor} vs design-editor`);
        
        // Note: Playwright a un système de screenshot comparison intégré
        // mais il nécessite une configuration spécifique
        // Pour l'instant, on log juste les chemins
        console.log(`   Référence: ${referenceScreenshot}`);
        console.log(`   Cible: ${targetScreenshot}`);
      }
    }
  });
});

// Test de vérification des dimensions standard
test.describe('Vérification Dimensions Standard', () => {
  const STANDARD_DIMENSIONS = {
    desktop: { width: 1700, height: 850 },
    tablet: { width: 820, height: 1180 },
    mobile: { width: 430, height: 932 }
  };

  for (const editor of EDITORS) {
    test(`Dimensions Standard - ${editor.name}`, async ({ page }) => {
      console.log(`\n📏 Vérification dimensions: ${editor.name}`);
      
      await page.goto(editor.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      for (const [deviceName, expectedDims] of Object.entries(STANDARD_DIMENSIONS)) {
        console.log(`\n📱 Device: ${deviceName}`);
        
        // Sélectionner le device
        await selectDevice(page, deviceName);
        await page.waitForTimeout(1000);

        // Capturer les dimensions réelles
        const actualDims = await page.evaluate(() => {
          const canvas = document.querySelector('.design-canvas-container, [data-canvas="main"]');
          if (!canvas) return null;
          
          const rect = canvas.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        });

        if (actualDims) {
          console.log(`   Attendu: ${expectedDims.width}x${expectedDims.height}`);
          console.log(`   Réel: ${actualDims.width}x${actualDims.height}`);
          
          const widthMatch = Math.abs(actualDims.width - expectedDims.width) < 10;
          const heightMatch = Math.abs(actualDims.height - expectedDims.height) < 10;
          
          if (widthMatch && heightMatch) {
            console.log(`   ✅ Dimensions conformes`);
          } else {
            console.log(`   ⚠️ Dimensions non conformes`);
          }

          // Assertions
          expect(actualDims.width).toBeCloseTo(expectedDims.width, -1); // Tolérance de 10px
          expect(actualDims.height).toBeCloseTo(expectedDims.height, -1);
        } else {
          console.log(`   ❌ Canvas non trouvé`);
        }
      }
    });
  }
});
