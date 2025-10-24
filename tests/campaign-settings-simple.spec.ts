import { test, expect } from '@playwright/test';

/**
 * Tests Simplifiés - Validation Bouton "Paramètres"
 * 
 * Ces tests vérifient que le bouton "Paramètres" fonctionne correctement
 * dans tous les éditeurs SANS l'erreur "Sauvegarde distante échouée".
 * 
 * NOTE: Ces tests supposent que l'utilisateur est déjà authentifié.
 * Si vous voyez une redirection vers /login, connectez-vous manuellement
 * dans le browser Playwright et relancez les tests.
 */

test.describe('Validation Corrections - Bouton Paramètres', () => {
  
  // Test générique pour chaque éditeur
  async function testSettingsButton(page, editorPath: string, editorName: string) {
    console.log(`\n🧪 Test ${editorName}...`);

    // 1. Aller sur l'éditeur
    await page.goto(editorPath);
    console.log(`✓ Navigation ${editorPath}`);

    // 2. Attendre le chargement
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Temps pour React
    
    // 3. Vérifier qu'on n'est pas sur la page de login
    const url = page.url();
    if (url.includes('/login') || url.includes('/auth')) {
      console.log(`❌ Redirection vers login détectée - Authentification requise`);
      console.log(`➡️  Connectez-vous manuellement et relancez les tests`);
      throw new Error('Authentification requise - Connectez-vous manuellement');
    }
    
    // 4. Trouver et cliquer sur "Paramètres"
    const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
    
    try {
      await settingsButton.waitFor({ state: 'visible', timeout: 15000 });
      console.log(`✓ Bouton "Paramètres" trouvé`);
    } catch (e) {
      console.error(`❌ Bouton "Paramètres" introuvable après 15s`);
      // Prendre un screenshot pour debug
      await page.screenshot({ path: `debug-${editorName}-no-button.png` });
      throw e;
    }

    // 5. Vérifier que le bouton n'est pas disabled
    const isDisabled = await settingsButton.isDisabled();
    if (isDisabled) {
      console.error(`❌ Bouton "Paramètres" est disabled (devrait être actif)`);
      throw new Error('Bouton Paramètres disabled - Correction non appliquée');
    }
    console.log(`✓ Bouton "Paramètres" actif (pas disabled)`);

    // 6. Cliquer sur Paramètres
    await settingsButton.click();
    console.log(`✓ Clic sur "Paramètres"`);

    // 7. Attendre que la modale s'ouvre
    const modalTitle = page.locator('text=Paramètres de la campagne').first();
    try {
      await modalTitle.waitFor({ state: 'visible', timeout: 15000 });
      console.log(`✓ Modale ouverte`);
    } catch (e) {
      console.error(`❌ Modale ne s'est pas ouverte`);
      await page.screenshot({ path: `debug-${editorName}-no-modal.png` });
      throw e;
    }

    // 8. VÉRIFICATION CRITIQUE: Pas de message d'erreur
    const errorMessage = page.locator('text=Sauvegarde distante échouée');
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    
    if (errorVisible) {
      console.error(`❌ MESSAGE D'ERREUR DÉTECTÉ: "Sauvegarde distante échouée"`);
      await page.screenshot({ path: `ERREUR-${editorName}-fallback-localStorage.png` });
      throw new Error('BUG CRITIQUE: Message "Sauvegarde distante échouée" toujours présent');
    }
    console.log(`✅ Pas de message "Sauvegarde distante échouée"`);

    // 9. Vérifier que les onglets sont présents
    const canaux = page.locator('button').filter({ hasText: 'Canaux' }).first();
    const parametres = page.locator('button').filter({ hasText: 'Paramètres' }).nth(1); // 2ème occurrence (1er = toolbar)
    
    await expect(canaux).toBeVisible({ timeout: 5000 });
    await expect(parametres).toBeVisible({ timeout: 5000 });
    console.log(`✓ Onglets de la modale présents`);

    // 10. Fermer la modale (optionnel)
    const closeButton = page.locator('button[title="Fermer"]').first();
    if (await closeButton.isVisible({ timeout: 2000 })) {
      await closeButton.click();
      console.log(`✓ Modale fermée`);
    }

    console.log(`✅ ${editorName} - TEST RÉUSSI\n`);
  }

  // Tests pour chaque éditeur
  test('QuizEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/quiz-editor', 'QuizEditor');
  });

  test('DesignEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/design-editor', 'DesignEditor');
  });

  test('FormEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/form-editor', 'FormEditor');
  });

  test('JackpotEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/jackpot-editor', 'JackpotEditor');
  });

  test('ScratchCardEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/scratch-editor', 'ScratchCardEditor');
  });

  test('ModelEditor - Bouton Paramètres OK', async ({ page }) => {
    await testSettingsButton(page, '/model-editor', 'ModelEditor');
  });
});
