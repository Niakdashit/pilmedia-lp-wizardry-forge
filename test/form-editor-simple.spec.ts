import { test, expect } from '@playwright/test';

test.describe('FormEditor - Debug Simple', () => {
  test('FormEditor page should load', async ({ page }) => {
    // Écouter les erreurs console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('[BROWSER ERROR]:', msg.text());
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('[PAGE ERROR]:', error.message);
      errors.push(error.message);
    });

    // Charger la page
    await page.goto('http://localhost:8080/form-editor', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Capturer le HTML de la page
    const html = await page.content();
    console.log('[PAGE LENGTH]:', html.length);

    // Vérifier qu'il n'y a pas de page blanche
    expect(html.length).toBeGreaterThan(100);

    // Vérifier le titre ou un élément de base
    const title = await page.title();
    console.log('[PAGE TITLE]:', title);

    // Chercher le root div
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Afficher les erreurs capturées
    if (errors.length > 0) {
      console.log('[ERRORS CAPTURED]:', errors.length);
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err.substring(0, 200)}`));
    }

    // Capturer une screenshot pour debug
    await page.screenshot({ path: 'test-results/form-editor-debug.png', fullPage: true });

    // Vérifier que les principaux composants sont présents
    const body = await page.locator('body').innerHTML();
    console.log('[BODY CONTAINS "FormEditor"]:', body.includes('FormEditor') || body.includes('form-editor'));
    console.log('[BODY CONTAINS "canvas"]:', body.includes('canvas') || body.includes('Canvas'));
    console.log('[BODY CONTAINS "screen"]:', body.includes('screen'));

    // Lister tous les data-screen-anchor
    const screenAnchors = await page.locator('[data-screen-anchor]').all();
    console.log('[SCREEN ANCHORS FOUND]:', screenAnchors.length);

    // Lister tous les divs avec classes pertinentes
    const canvasElements = await page.locator('[class*="canvas"]').count();
    console.log('[CANVAS ELEMENTS]:', canvasElements);

    const designElements = await page.locator('[class*="design"]').count();
    console.log('[DESIGN ELEMENTS]:', designElements);
  });

  test('Check basic structure', async ({ page }) => {
    await page.goto('http://localhost:8080/form-editor');
    await page.waitForTimeout(2000);

    // Log la structure DOM
    const structure = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return 'NO ROOT';
      
      const getStructure = (el: Element, depth = 0): string => {
        if (depth > 5) return '';
        const indent = '  '.repeat(depth);
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const classes = el.className ? `.${el.className.split(' ').slice(0, 3).join('.')}` : '';
        const dataAttrs = Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `[${attr.name}="${attr.value}"]`)
          .join('');
        
        let result = `${indent}<${tag}${id}${classes}${dataAttrs}>\n`;
        
        for (let i = 0; i < Math.min(el.children.length, 10); i++) {
          result += getStructure(el.children[i], depth + 1);
        }
        
        return result;
      };
      
      return getStructure(root);
    });

    console.log('[DOM STRUCTURE]:\n', structure.substring(0, 2000));
  });
});
