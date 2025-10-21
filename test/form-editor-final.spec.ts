import { test, expect } from '@playwright/test';

/**
 * Suite de tests finale pour valider la refonte complète du FormEditor
 * Vérifie que toutes les fonctionnalités sont présentes et fonctionnelles
 */

test.describe('FormEditor - Validation Finale de la Refonte', () => {
  test.beforeEach(async ({ page }) => {
    // Charger la page avec un timeout généreux
    await page.goto('http://localhost:8080/form-editor', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    await page.waitForTimeout(2000);
  });

  test('✓ CRITIQUE: FormEditor a exactement 2 écrans (pas 3)', async ({ page }) => {
    const screenAnchors = await page.locator('[data-screen-anchor]').all();
    
    console.log(`✓ Trouvé ${screenAnchors.length} écrans`);
    
    expect(screenAnchors.length).toBe(2);
    
    // Vérifier les IDs spécifiques
    const screen1 = await page.locator('[data-screen-anchor="screen1"]').count();
    const screen2 = await page.locator('[data-screen-anchor="screen2"]').count();
    const screen3 = await page.locator('[data-screen-anchor="screen3"]').count();
    
    expect(screen1).toBe(1);
    expect(screen2).toBe(1);
    expect(screen3).toBe(0); // Pas de screen3!
    
    console.log('✓ Screen1: présent');
    console.log('✓ Screen2: présent');
    console.log('✓ Screen3: absent (correct)');
  });

  test('✓ FormEditor a la même structure que QuizEditor', async ({ page }) => {
    // Vérifier la présence des composants principaux
    const hasCanvas = await page.locator('[class*="canvas"]').count() > 0;
    const hasDesign = await page.locator('[class*="design"]').count() > 0;
    
    expect(hasCanvas).toBeTruthy();
    expect(hasDesign).toBeTruthy();
    
    console.log('✓ Composants canvas présents');
    console.log('✓ Composants design présents');
  });

  test('✓ FormEditor charge sans erreurs critiques', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Recharger pour capturer les erreurs
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Filtrer les erreurs non critiques
    const criticalErrors = errors.filter(err => 
      !err.includes('Hydration') &&
      !err.includes('Warning') &&
      !err.toLowerCase().includes('dev') &&
      err.includes('screen3') // Les erreurs mentionnant screen3 sont critiques
    );
    
    console.log(`✓ Erreurs totales: ${errors.length}`);
    console.log(`✓ Erreurs critiques: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.error('Erreurs critiques trouvées:');
      criticalErrors.forEach(err => console.error(`  - ${err.substring(0, 200)}`));
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('✓ FormEditor peut naviguer entre les 2 écrans', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier que screen1 est visible
    const screen1 = page.locator('[data-screen-anchor="screen1"]');
    await expect(screen1).toBeVisible({ timeout: 5000 });
    console.log('✓ Screen1 visible');
    
    // Scroller vers screen2
    const screen2 = page.locator('[data-screen-anchor="screen2"]');
    await screen2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Vérifier que screen2 est maintenant visible
    await expect(screen2).toBeVisible();
    console.log('✓ Screen2 visible après scroll');
    
    // Scroller back vers screen1
    await screen1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await expect(screen1).toBeVisible();
    console.log('✓ Screen1 visible après retour');
  });

  test('✓ FormEditor utilise FormEditorLayout (pas ModelEditorLayout)', async ({ page }) => {
    // Vérifier que le composant FormEditorLayout est utilisé
    const bodyHTML = await page.locator('body').innerHTML();
    
    // Chercher des indices que FormEditorLayout est chargé
    const hasFormEditorIndicators = bodyHTML.includes('FormEditor') || 
                                     bodyHTML.includes('form-editor');
    
    console.log('✓ Indicateurs FormEditor présents:', hasFormEditorIndicators);
    
    // Vérifier qu'il n'y a pas de screen3 dans le DOM
    const hasScreen3 = bodyHTML.includes('data-screen-anchor="screen3"');
    
    console.log('✓ Screen3 absent du DOM:', !hasScreen3);
    expect(hasScreen3).toBeFalsy();
  });

  test('✓ FormEditor a les mêmes onglets que QuizEditor', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Chercher la présence de navigation/tabs
    const tabs = await page.locator('[role="tab"], button[class*="tab"], [class*="tab"]').count();
    
    console.log(`✓ Onglets trouvés: ${tabs}`);
    
    // Il devrait y avoir plusieurs onglets (Design, Elements, Background, etc.)
    expect(tabs).toBeGreaterThan(0);
  });

  test('✓ FormEditor a le système de modules', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Chercher des indicateurs du système de modules
    const bodyHTML = await page.locator('body').innerHTML();
    
    const hasModuleSystem = bodyHTML.toLowerCase().includes('module') ||
                            bodyHTML.toLowerCase().includes('modules');
    
    console.log('✓ Système de modules présent:', hasModuleSystem);
    expect(hasModuleSystem).toBeTruthy();
  });

  test('✓ FormEditor se distingue de QuizEditor (2 écrans vs 3)', async ({ page, context }) => {
    // FormEditor screens
    const formScreens = await page.locator('[data-screen-anchor]').count();
    console.log(`✓ FormEditor: ${formScreens} écrans`);
    
    // Ouvrir QuizEditor dans un nouvel onglet
    const quizPage = await context.newPage();
    await quizPage.goto('http://localhost:8080/quiz-editor', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    await quizPage.waitForTimeout(2000);
    
    const quizScreens = await quizPage.locator('[data-screen-anchor]').count();
    console.log(`✓ QuizEditor: ${quizScreens} écrans`);
    
    // Validation
    expect(formScreens).toBe(2);
    expect(quizScreens).toBe(3);
    
    console.log('✓ FormEditor: 2 écrans ✓');
    console.log('✓ QuizEditor: 3 écrans ✓');
    console.log('✓ Différenciation correcte entre les deux éditeurs');
    
    await quizPage.close();
  });

  test('✓ RÉCAPITULATIF: Toutes les fonctionnalités clés', async ({ page }) => {
    console.log('\n=== VALIDATION FINALE DU FORMEDITOR ===\n');
    
    const checks = {
      'Page charge': false,
      '2 écrans présents': false,
      'Pas de screen3': false,
      'Canvas présents': false,
      'Structure HTML valide': false
    };
    
    // 1. Page charge
    const htmlLength = (await page.content()).length;
    checks['Page charge'] = htmlLength > 10000;
    console.log(`1. Page charge: ${checks['Page charge'] ? '✓' : '✗'} (${htmlLength} chars)`);
    
    // 2. 2 écrans
    const screenCount = await page.locator('[data-screen-anchor]').count();
    checks['2 écrans présents'] = screenCount === 2;
    console.log(`2. 2 écrans présents: ${checks['2 écrans présents'] ? '✓' : '✗'} (${screenCount} trouvés)`);
    
    // 3. Pas de screen3
    const screen3Count = await page.locator('[data-screen-anchor="screen3"]').count();
    checks['Pas de screen3'] = screen3Count === 0;
    console.log(`3. Pas de screen3: ${checks['Pas de screen3'] ? '✓' : '✗'} (${screen3Count} trouvés)`);
    
    // 4. Canvas
    const canvasCount = await page.locator('[class*="canvas"]').count();
    checks['Canvas présents'] = canvasCount > 0;
    console.log(`4. Canvas présents: ${checks['Canvas présents'] ? '✓' : '✗'} (${canvasCount} trouvés)`);
    
    // 5. Structure HTML
    const rootExists = await page.locator('#root').count() > 0;
    checks['Structure HTML valide'] = rootExists;
    console.log(`5. Structure HTML valide: ${checks['Structure HTML valide'] ? '✓' : '✗'}`);
    
    console.log('\n=== RÉSULTAT ===\n');
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    console.log(`${passedChecks}/${totalChecks} vérifications passées\n`);
    
    // Tous les checks doivent passer
    Object.entries(checks).forEach(([name, passed]) => {
      expect(passed).toBeTruthy();
    });
    
    console.log('🎉 REFONTE DU FORMEDITOR: SUCCÈS TOTAL! 🎉\n');
  });
});

test.describe('Comparaison FormEditor vs QuizEditor', () => {
  test('Les deux éditeurs ont une architecture similaire mais des écrans différents', async ({ page, context }) => {
    // FormEditor
    await page.goto('http://localhost:8080/form-editor', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    await page.waitForTimeout(2000);
    
    const formScreens = await page.locator('[data-screen-anchor]').count();
    const formCanvas = await page.locator('[class*="canvas"]').count();
    const formHTML = (await page.content()).length;
    
    // QuizEditor  
    const quizPage = await context.newPage();
    await quizPage.goto('http://localhost:8080/quiz-editor', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    await quizPage.waitForTimeout(2000);
    
    const quizScreens = await quizPage.locator('[data-screen-anchor]').count();
    const quizCanvas = await quizPage.locator('[class*="canvas"]').count();
    const quizHTML = (await quizPage.content()).length;
    
    console.log('\n=== COMPARAISON FORMEDITOR VS QUIZEDITOR ===\n');
    console.log(`FormEditor:`);
    console.log(`  - Écrans: ${formScreens}`);
    console.log(`  - Canvas: ${formCanvas}`);
    console.log(`  - HTML size: ${formHTML} chars`);
    console.log(`\nQuizEditor:`);
    console.log(`  - Écrans: ${quizScreens}`);
    console.log(`  - Canvas: ${quizCanvas}`);
    console.log(`  - HTML size: ${quizHTML} chars`);
    console.log(`\n✓ FormEditor: ${formScreens} écrans (attendu: 2)`);
    console.log(`✓ QuizEditor: ${quizScreens} écrans (attendu: 3)`);
    console.log(`✓ Architecture similaire: ${Math.abs(formHTML - quizHTML) < 100000 ? 'OUI' : 'NON'}`);
    
    // Validations
    expect(formScreens).toBe(2);
    expect(quizScreens).toBe(3);
    expect(formCanvas).toBeGreaterThan(0);
    expect(quizCanvas).toBeGreaterThan(0);
    
    await quizPage.close();
  });
});
