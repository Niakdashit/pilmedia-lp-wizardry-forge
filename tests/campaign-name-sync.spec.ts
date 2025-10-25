import { test, expect } from '@playwright/test';

/**
 * Test de synchronisation du nom de campagne
 *
 * Ce test vérifie que le nom saisi dans la modale "Nommer votre campagne"
 * apparaît correctement dans les paramètres de campagne (onglet Canaux).
 */

test.describe('Synchronisation Nom de Campagne', () => {

  async function testCampaignNameSync(page, editorPath: string, editorName: string) {
    console.log(`\n🧪 Test synchronisation nom campagne - ${editorName}...`);

    // 1. Aller sur l'éditeur (nouvelle campagne)
    await page.goto(editorPath);
    console.log(`✓ Navigation ${editorPath}`);

    // 2. Attendre le chargement complet
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // Temps pour React + création campagne

    // 3. Vérifier qu'on n'est pas sur login
    const url = page.url();
    if (url.includes('/login') || url.includes('/auth')) {
      console.log(`❌ Redirection vers login détectée - Authentification requise`);
      throw new Error('Authentification requise - Connectez-vous manuellement');
    }

    // 4. Attendre et vérifier la modale "Nommer votre campagne"
    const namingModalTitle = page.locator('text=Nommer votre campagne').first();
    try {
      await namingModalTitle.waitFor({ state: 'visible', timeout: 15000 });
      console.log(`✓ Modale "Nommer votre campagne" détectée`);
    } catch (e) {
      console.error(`❌ Modale "Nommer votre campagne" introuvable`);
      await page.screenshot({ path: `debug-${editorName}-no-naming-modal.png` });
      throw new Error('Modale de nommage introuvable');
    }

    // 5. Générer un nom unique pour le test
    const testCampaignName = `Test Campagne ${Date.now()}`;
    console.log(`📝 Nom de test généré: ${testCampaignName}`);

    // 6. Remplir le champ nom et cliquer sur Enregistrer
    const nameInput = page.locator('input[placeholder*="campagne"]').first();
    await nameInput.fill(testCampaignName);
    console.log(`✓ Nom saisi dans la modale`);

    const saveButton = page.locator('button').filter({ hasText: 'Enregistrer' }).first();
    await saveButton.click();
    console.log(`✓ Clic sur "Enregistrer"`);

    // 7. Attendre que la modale se ferme
    await page.waitForTimeout(2000); // Temps pour la sauvegarde

    // 8. Ouvrir les paramètres de campagne
    const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
    try {
      await settingsButton.waitFor({ state: 'visible', timeout: 10000 });
      await settingsButton.click();
      console.log(`✓ Clic sur "Paramètres"`);
    } catch (e) {
      console.error(`❌ Bouton "Paramètres" introuvable`);
      await page.screenshot({ path: `debug-${editorName}-no-settings-button.png` });
      throw e;
    }

    // 9. Attendre que la modale paramètres s'ouvre
    const modalTitle = page.locator('text=Paramètres de la campagne').first();
    try {
      await modalTitle.waitFor({ state: 'visible', timeout: 15000 });
      console.log(`✓ Modale paramètres ouverte`);
    } catch (e) {
      console.error(`❌ Modale paramètres ne s'ouvre pas`);
      await page.screenshot({ path: `debug-${editorName}-no-settings-modal.png` });
      throw e;
    }

    // 10. Vérifier que l'onglet "Canaux" est actif par défaut
    const canauxTab = page.locator('button').filter({ hasText: 'Canaux' }).first();
    await expect(canauxTab).toBeVisible();
    console.log(`✓ Onglet "Canaux" visible`);

    // 11. VÉRIFICATION CRITIQUE: Le nom doit être présent dans le champ
    const campaignNameInput = page.locator('input[placeholder*="campagne"]').first();
    try {
      await campaignNameInput.waitFor({ state: 'visible', timeout: 5000 });
      const actualValue = await campaignNameInput.inputValue();
      console.log(`📋 Valeur du champ nom: "${actualValue}"`);

      if (actualValue !== testCampaignName) {
        console.error(`❌ NOM INCORRECT: attendu "${testCampaignName}", obtenu "${actualValue}"`);
        await page.screenshot({ path: `ERROR-${editorName}-wrong-name.png` });
        throw new Error(`Nom de campagne incorrect: "${actualValue}" au lieu de "${testCampaignName}"`);
      }

      console.log(`✅ Nom de campagne CORRECT: "${actualValue}"`);
    } catch (e) {
      console.error(`❌ Champ nom de campagne introuvable dans paramètres`);
      await page.screenshot({ path: `ERROR-${editorName}-no-name-field.png` });
      throw new Error('Champ nom de campagne manquant dans les paramètres');
    }

    // 12. Fermer la modale paramètres
    const closeButton = page.locator('button[title="Fermer"]').first();
    if (await closeButton.isVisible({ timeout: 2000 })) {
      await closeButton.click();
      console.log(`✓ Modale paramètres fermée`);
    }

    console.log(`✅ ${editorName} - SYNCHRONISATION RÉUSSIE\n`);
  }

  // Tests pour chaque éditeur
  test('DesignEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/design-editor', 'DesignEditor');
  });

  test('QuizEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/quiz-editor', 'QuizEditor');
  });

  test('FormEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/form-editor', 'FormEditor');
  });

  test('JackpotEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/jackpot-editor', 'JackpotEditor');
  });

  test('ScratchCardEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/scratch-editor', 'ScratchCardEditor');
  });

  test('ModelEditor - Synchronisation nom campagne', async ({ page }) => {
    await testCampaignNameSync(page, '/model-editor', 'ModelEditor');
  });
});
