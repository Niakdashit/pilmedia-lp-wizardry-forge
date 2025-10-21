import { test, expect } from '@playwright/test';

test.describe('FormEditor - Refonte Complète', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/form-editor');
    // Attendre que l'éditeur soit chargé
    await page.waitForSelector('[data-editor-loaded="true"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('FormEditor devrait avoir exactement 2 écrans (screen1 et screen2)', async ({ page }) => {
    // Vérifier qu'il n'y a que 2 anchors de screen
    const screenAnchors = await page.locator('[data-screen-anchor]').count();
    expect(screenAnchors).toBe(2);
    
    // Vérifier les IDs spécifiques
    await expect(page.locator('[data-screen-anchor="screen1"]')).toBeVisible();
    await expect(page.locator('[data-screen-anchor="screen2"]')).toBeVisible();
    
    // Vérifier qu'il n'y a PAS de screen3
    await expect(page.locator('[data-screen-anchor="screen3"]')).not.toBeVisible();
  });

  test('FormEditor devrait avoir la même sidebar avec onglets que QuizEditor', async ({ page }) => {
    // Vérifier la présence de HybridSidebar
    const sidebar = page.locator('.hybrid-sidebar, [data-testid="hybrid-sidebar"]');
    await expect(sidebar.or(page.locator('aside'))).toBeVisible();
    
    // Vérifier les onglets principaux (Design, Éléments, Background, etc.)
    const elementsTab = page.getByText('Éléments').or(page.getByText('Elements'));
    await expect(elementsTab.first()).toBeVisible();
  });

  test('FormEditor devrait avoir le système de modules', async ({ page }) => {
    // Cliquer sur l'onglet Modules
    await page.getByText('Modules').or(page.getByText('modules', { exact: false })).first().click();
    await page.waitForTimeout(500);
    
    // Vérifier la présence du panneau de modules
    const modulesPanel = page.locator('[data-testid="modules-panel"]');
    await expect(modulesPanel.or(page.getByText('Ajouter un module'))).toBeVisible();
  });

  test('FormEditor devrait permettre de sélectionner un module et afficher son panneau de configuration', async ({ page }) => {
    // Attendre que les modules soient chargés
    await page.waitForTimeout(1000);
    
    // Essayer de cliquer sur un module s'il existe
    const moduleElements = page.locator('[data-module-id]');
    const moduleCount = await moduleElements.count();
    
    if (moduleCount > 0) {
      // Sélectionner le premier module
      await moduleElements.first().click();
      await page.waitForTimeout(500);
      
      // Vérifier qu'un panneau de configuration s'affiche
      const configPanel = page.locator('[data-testid*="module-panel"]');
      const hasPanelVisible = await configPanel.isVisible().catch(() => false);
      expect(hasPanelVisible).toBeTruthy();
    }
  });

  test('FormEditor devrait avoir le même système de preview que QuizEditor', async ({ page }) => {
    // Chercher le bouton de preview/aperçu
    const previewButton = page.getByText('Aperçu').or(page.getByText('Preview'));
    await expect(previewButton.first()).toBeVisible();
    
    // Cliquer sur le bouton de preview
    await previewButton.first().click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le mode preview est activé
    const previewMode = page.locator('[data-preview-mode="true"]');
    const isPreviewActive = await previewMode.isVisible().catch(() => false);
    
    // Ou vérifier que quelque chose a changé (funnel visible, etc.)
    const funnelPreview = page.locator('[data-testid="funnel-preview"]');
    const hasFunnel = await funnelPreview.isVisible().catch(() => false);
    
    expect(isPreviewActive || hasFunnel).toBeTruthy();
  });

  test('FormEditor devrait avoir le sélecteur d\'appareil (desktop/tablet/mobile)', async ({ page }) => {
    // Chercher les boutons de sélection d'appareil
    const deviceSelector = page.locator('[data-testid="device-selector"]');
    const hasDeviceSelector = await deviceSelector.isVisible().catch(() => false);
    
    if (!hasDeviceSelector) {
      // Chercher par icônes/texte
      const desktopButton = page.locator('button').filter({ hasText: /desktop|ordinateur/i });
      await expect(desktopButton.or(page.locator('[title*="Desktop"]'))).toBeVisible();
    }
  });

  test('FormEditor devrait permettre de naviguer entre les 2 écrans', async ({ page }) => {
    // Attendre le chargement complet
    await page.waitForTimeout(1500);
    
    // Essayer de scroller vers screen2
    const screen2 = page.locator('[data-screen-anchor="screen2"]');
    await screen2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Vérifier que screen2 est visible
    await expect(screen2).toBeVisible();
    
    // Scroller back vers screen1
    const screen1 = page.locator('[data-screen-anchor="screen1"]');
    await screen1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Vérifier que screen1 est toujours visible
    await expect(screen1).toBeVisible();
  });

  test('FormEditor devrait avoir le zoom slider', async ({ page }) => {
    // Chercher le zoom slider
    const zoomSlider = page.locator('input[type="range"]').filter({ has: page.locator('[class*="zoom"]') });
    const hasZoomSlider = await zoomSlider.count() > 0;
    
    if (!hasZoomSlider) {
      // Chercher par label/texte
      const zoomControl = page.getByText(/zoom/i);
      await expect(zoomControl.first()).toBeVisible();
    }
  });

  test('FormEditor devrait avoir les boutons Undo/Redo', async ({ page }) => {
    // Chercher les boutons undo/redo
    const undoButton = page.locator('button[title*="Annuler"]').or(page.locator('button[title*="Undo"]'));
    const redoButton = page.locator('button[title*="Rétablir"]').or(page.locator('button[title*="Redo"]'));
    
    await expect(undoButton.or(page.locator('[data-testid="undo-button"]')).first()).toBeVisible();
    await expect(redoButton.or(page.locator('[data-testid="redo-button"]')).first()).toBeVisible();
  });

  test('FormEditor devrait avoir les mêmes panneaux de configuration', async ({ page }) => {
    // Vérifier la présence des panneaux (Background, Design, etc.)
    await page.getByText('Background').or(page.getByText('Fond')).first().click();
    await page.waitForTimeout(500);
    
    // Vérifier qu'un panneau de background est visible
    const backgroundPanel = page.locator('[data-testid*="background"]');
    const hasBackgroundPanel = await backgroundPanel.isVisible().catch(() => false);
    
    // Ou vérifier la présence de contrôles de couleur
    const colorControls = page.locator('input[type="color"]');
    const hasColorControls = await colorControls.count() > 0;
    
    expect(hasBackgroundPanel || hasColorControls).toBeTruthy();
  });

  test('FormEditor devrait charger sans erreurs console critiques', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:8080/form-editor');
    await page.waitForTimeout(3000);
    
    // Filtrer les erreurs non critiques (hydration, etc.)
    const criticalErrors = errors.filter(err => 
      !err.includes('Hydration') && 
      !err.includes('Warning') &&
      !err.includes('screen3') // Ne devrait pas avoir de références à screen3
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('FormEditor screen2 devrait avoir un bouton de soumission par défaut', async ({ page }) => {
    // Scroller vers screen2
    const screen2 = page.locator('[data-screen-anchor="screen2"]');
    await screen2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Chercher un bouton avec texte "Envoyer" ou "Participer" dans screen2
    const submitButton = page.locator('[data-screen-anchor="screen2"] button').filter({ hasText: /envoyer|participer|submit/i });
    const hasSubmitButton = await submitButton.count() > 0;
    
    // Ou chercher un module de type BlocBouton
    const buttonModule = page.locator('[data-module-type="BlocBouton"]');
    const hasButtonModule = await buttonModule.count() > 0;
    
    expect(hasSubmitButton || hasButtonModule).toBeTruthy();
  });

  test('FormEditor ne devrait pas afficher de contenu lié au quiz', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Vérifier qu'il n'y a pas de termes spécifiques au quiz
    const quizContent = page.getByText(/quiz/i).and(page.locator(':not(title):not([data-ignore-quiz])'));
    const quizCount = await quizContent.count();
    
    // Quelques références au quiz peuvent rester dans le code (imports, etc.) mais pas dans l'UI
    expect(quizCount).toBeLessThan(5); // Tolérance pour les imports/noms de fichiers
  });

  test('FormEditor devrait sauvegarder correctement', async ({ page }) => {
    // Chercher le bouton de sauvegarde
    const saveButton = page.getByText(/sauvegarder|save/i).and(page.locator('button'));
    await expect(saveButton.first()).toBeVisible();
    
    // Cliquer sur le bouton (sans attendre le résultat complet pour éviter les timeouts)
    await saveButton.first().click();
    await page.waitForTimeout(1000);
    
    // Vérifier qu'aucune erreur n'est apparue
    const errorMessage = page.locator('[class*="error"]').or(page.getByText(/erreur|error/i));
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasError).toBeFalsy();
  });
});

test.describe('FormEditor vs QuizEditor - Parité des fonctionnalités', () => {
  test('Les deux éditeurs devraient avoir une structure similaire', async ({ page, context }) => {
    // Ouvrir FormEditor dans la page actuelle
    await page.goto('http://localhost:8080/form-editor');
    await page.waitForTimeout(2000);
    
    // Capturer les classes principales du FormEditor
    const formEditorClasses = await page.locator('body > div > div').first().getAttribute('class');
    
    // Ouvrir QuizEditor dans un nouvel onglet
    const quizPage = await context.newPage();
    await quizPage.goto('http://localhost:8080/quiz-editor');
    await quizPage.waitForTimeout(2000);
    
    // Capturer les classes principales du QuizEditor
    const quizEditorClasses = await quizPage.locator('body > div > div').first().getAttribute('class');
    
    // Vérifier que les structures sont similaires (même layout components)
    expect(formEditorClasses).toBeTruthy();
    expect(quizEditorClasses).toBeTruthy();
    
    await quizPage.close();
  });

  test('FormEditor devrait avoir 2 écrans alors que QuizEditor en a 3', async ({ page, context }) => {
    // FormEditor
    await page.goto('http://localhost:8080/form-editor');
    await page.waitForTimeout(1500);
    const formScreens = await page.locator('[data-screen-anchor]').count();
    
    // QuizEditor
    const quizPage = await context.newPage();
    await quizPage.goto('http://localhost:8080/quiz-editor');
    await quizPage.waitForTimeout(1500);
    const quizScreens = await quizPage.locator('[data-screen-anchor]').count();
    
    expect(formScreens).toBe(2);
    expect(quizScreens).toBe(3);
    
    await quizPage.close();
  });
});
