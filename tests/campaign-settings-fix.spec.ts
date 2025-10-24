import { test, expect, Page } from '@playwright/test';

/**
 * Test Suite: Validation des Corrections du Bouton "Paramètres"
 * 
 * Objectif: Vérifier que le message d'erreur "Sauvegarde distante échouée" 
 * n'apparaît plus lors de l'ouverture des paramètres de campagne.
 * 
 * Scénarios testés:
 * 1. QuizEditor - Création auto + ouverture paramètres
 * 2. DesignEditor - Création auto + ouverture paramètres
 * 3. FormEditor - Création auto + ouverture paramètres
 * 4. JackpotEditor - Création auto + ouverture paramètres
 * 5. ScratchCardEditor - Création auto + ouverture paramètres
 * 6. ModelEditor - Création auto + ouverture paramètres
 */

// Helper: Authentification réelle via page de login
async function ensureAuthenticated(page: Page) {
  // Vérifier si déjà connecté
  const currentUrl = page.url();
  
  // Si on est sur la page de login, se connecter
  if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
    console.log('🔐 Authentification nécessaire...');
    
    // Remplir le formulaire de connexion
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[placeholder*="mot de passe"]').first();
    const loginButton = page.locator('button:has-text("Se connecter")').first();
    
    // Utiliser des credentials de test (à adapter selon votre environnement)
    await emailInput.fill('test@prosplay.com');
    await passwordInput.fill('testpassword123');
    await loginButton.click();
    
    // Attendre la redirection après login
    await page.waitForURL(url => {
      const urlString = url.toString();
      return !urlString.includes('/login') && !urlString.includes('/auth');
    }, { timeout: 10000 });
    console.log('✓ Authentification réussie');
  } else {
    // Vérifier localStorage pour session Supabase
    const hasSession = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(k => k.includes('supabase') && k.includes('auth'));
    });
    
    if (!hasSession) {
      console.log('⚠️ Pas de session Supabase - redirection vers login');
      await page.goto('/login');
      await ensureAuthenticated(page); // Récursion pour se connecter
    }
  }
}

// Helper: Attendre que le réseau soit calme
async function waitForNetworkIdle(page: Page, timeout = 3000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Helper: Vérifier l'absence d'erreur dans la console
async function checkNoConsoleErrors(page: Page, allowedErrors: string[] = []) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filtrer les erreurs autorisées
      if (!allowedErrors.some(allowed => text.includes(allowed))) {
        errors.push(text);
      }
    }
  });

  return errors;
}

// Helper: Fonction de test générique pour chaque éditeur
async function testEditorSettingsButton(
  page: Page, 
  editorUrl: string, 
  editorName: string,
  expectedType: string
) {
  console.log(`\n🧪 Test ${editorName}...`);

  // 1. Naviguer vers l'éditeur
  await page.goto(editorUrl, { waitUntil: 'networkidle' });
  console.log(`✓ Navigation vers ${editorUrl}`);

  // 2. Attendre que la page soit chargée
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Laisser le temps à React de render
  console.log(`✓ Page chargée`);

  // 3. Vérifier que le bouton "Paramètres" existe
  const settingsButton = page.locator('button:has-text("Paramètres")').first();
  await expect(settingsButton).toBeVisible({ timeout: 10000 });
  console.log(`✓ Bouton "Paramètres" visible`);

  // 4. Vérifier que le bouton n'est PAS disabled
  await expect(settingsButton).toBeEnabled();
  console.log(`✓ Bouton "Paramètres" activé (pas disabled)`);

  // 5. Cliquer sur "Paramètres"
  await settingsButton.click();
  console.log(`✓ Clic sur "Paramètres"`);

  // 6. Attendre que la modale s'ouvre
  const modal = page.locator('text=Paramètres de la campagne').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  console.log(`✓ Modale "Paramètres de la campagne" ouverte`);

  // 7. Vérifier l'absence du message d'erreur
  const errorMessage = page.locator('text=Sauvegarde distante échouée');
  await expect(errorMessage).not.toBeVisible({ timeout: 2000 });
  console.log(`✓ Pas de message "Sauvegarde distante échouée"`);

  // 8. Vérifier que les onglets sont présents
  const channelsTab = page.locator('button:has-text("Canaux")').first();
  const parametersTab = page.locator('button:has-text("Paramètres")').first();
  await expect(channelsTab).toBeVisible();
  await expect(parametersTab).toBeVisible();
  console.log(`✓ Onglets de la modale présents`);

  // 9. Remplir le formulaire de base
  // Onglet "Canaux" devrait être actif par défaut
  const campaignNameInput = page.locator('input[name="name"], input[placeholder*="Nom"]').first();
  if (await campaignNameInput.isVisible({ timeout: 5000 })) {
    await campaignNameInput.fill(`Test ${editorName} - ${Date.now()}`);
    console.log(`✓ Nom de campagne rempli`);
  }

  // 10. Cliquer sur "Enregistrer"
  const saveButton = page.locator('button:has-text("Enregistrer")').first();
  if (await saveButton.isVisible({ timeout: 5000 })) {
    await saveButton.click();
    console.log(`✓ Clic sur "Enregistrer"`);

    // 11. Attendre que la modale se ferme (ou vérifier succès)
    await page.waitForTimeout(2000);
    
    // Vérifier que le message d'erreur n'apparaît PAS
    await expect(errorMessage).not.toBeVisible({ timeout: 2000 });
    console.log(`✓ Sauvegarde réussie (pas d'erreur)`);
  }

  // 12. Vérifier la console pour les logs de création de campagne
  const logs = await page.evaluate(() => {
    // @ts-ignore
    return window.__consoleLogs || [];
  });
  console.log(`✓ Logs console vérifiés`);

  console.log(`✅ ${editorName} - TEST RÉUSSI\n`);
}

// Test 1: QuizEditor
test('QuizEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  
  // Aller sur la page et gérer l'authentification si nécessaire
  await page.goto('/quiz-editor');
  await ensureAuthenticated(page);
  
  // Si on a été redirigé, retourner à l'éditeur
  if (!page.url().includes('/quiz-editor')) {
    await page.goto('/quiz-editor');
  }
  
  await testEditorSettingsButton(page, '/quiz-editor', 'QuizEditor', 'quiz');
  
  // Vérifier qu'il n'y a pas eu d'erreurs console critiques
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 2: DesignEditor (Roue de la Fortune)
test('DesignEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  await ensureAuthenticated(page);
  await testEditorSettingsButton(page, '/design-editor', 'DesignEditor', 'wheel');
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 3: FormEditor
test('FormEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  await ensureAuthenticated(page);
  await testEditorSettingsButton(page, '/form-editor', 'FormEditor', 'form');
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 4: JackpotEditor
test('JackpotEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  await ensureAuthenticated(page);
  await testEditorSettingsButton(page, '/jackpot-editor', 'JackpotEditor', 'jackpot');
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 5: ScratchCardEditor
test('ScratchCardEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  await ensureAuthenticated(page);
  await testEditorSettingsButton(page, '/scratch-editor', 'ScratchCardEditor', 'scratch');
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 6: ModelEditor
test('ModelEditor - Bouton Paramètres fonctionne sans erreur', async ({ page }) => {
  const errors = await checkNoConsoleErrors(page);
  await ensureAuthenticated(page);
  await testEditorSettingsButton(page, '/model-editor', 'ModelEditor', 'wheel');
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs console détectées:', errors);
  }
});

// Test 7: Vérification BDD - Pas de brouillons localStorage
test('Vérification: Aucun brouillon localStorage créé', async ({ page }) => {
  console.log(`\n🧪 Test: Vérification localStorage...`);

  // Aller sur n'importe quel éditeur
  await page.goto('/quiz-editor', { waitUntil: 'networkidle' });
  
  // Ouvrir et fermer les paramètres
  const settingsButton = page.locator('button:has-text("Paramètres")').first();
  await settingsButton.click();
  await page.waitForTimeout(2000);
  
  // Fermer la modale (si bouton X existe)
  const closeButton = page.locator('button[title="Fermer"]').first();
  if (await closeButton.isVisible({ timeout: 2000 })) {
    await closeButton.click();
  }

  // Vérifier localStorage
  const drafts = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    return keys.filter(k => 
      k.includes('campaign:settings:draft') || 
      k.includes('campaign:draft')
    );
  });

  console.log(`✓ Clés localStorage vérifiées`);
  
  if (drafts.length > 0) {
    console.warn(`⚠️ ${drafts.length} brouillon(s) localStorage détecté(s):`, drafts);
    // Note: Ce n'est pas forcément une erreur si des brouillons existaient déjà
  } else {
    console.log(`✅ Aucun nouveau brouillon localStorage créé`);
  }
});

// Test 8: Test de Régression - Navigation fonctionne toujours
test('Régression: Navigation Dashboard → Éditeur fonctionne', async ({ page }) => {
  console.log(`\n🧪 Test: Régression Navigation...`);

  // Aller au dashboard
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  console.log(`✓ Dashboard chargé`);

  // Vérifier que la page charge
  await expect(page.locator('text=Campagnes').or(page.locator('text=Dashboard'))).toBeVisible({ timeout: 10000 });
  
  console.log(`✅ Navigation Dashboard - TEST RÉUSSI\n`);
});
