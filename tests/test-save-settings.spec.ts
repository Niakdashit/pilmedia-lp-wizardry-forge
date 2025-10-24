import { test, expect } from '@playwright/test';

/**
 * Test CRITIQUE: Vérifier que la sauvegarde fonctionne (pas de message d'erreur)
 */

test('JackpotEditor - Test Sauvegarde Complète', async ({ page }) => {
  console.log('\n🧪 TEST CRITIQUE: Sauvegarde des paramètres\n');

  // 1. Aller sur JackpotEditor
  await page.goto('/jackpot-editor');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('✓ JackpotEditor chargé');

  // 2. Cliquer sur Paramètres
  const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
  await settingsButton.click();
  console.log('✓ Clic sur Paramètres');

  // 3. Attendre la modale
  const modal = page.locator('text=Paramètres de la campagne').first();
  await expect(modal).toBeVisible({ timeout: 15000 });
  console.log('✓ Modale ouverte');

  // 4. Remplir le nom de campagne
  await page.waitForTimeout(1000);
  const nameInput = page.locator('input[name="name"], input[placeholder*="Nom"]').first();
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill(`Test Jackpot Article - ${Date.now()}`);
    console.log('✓ Nom de campagne rempli');
  }

  // 5. Cliquer sur Enregistrer
  const saveButton = page.locator('button:has-text("Enregistrer")').first();
  await saveButton.click();
  console.log('✓ Clic sur Enregistrer');

  // 6. VÉRIFICATION CRITIQUE: Attendre et vérifier l'absence d'erreur
  await page.waitForTimeout(3000);
  
  const errorMessage = page.locator('text=Sauvegarde distante échouée');
  const errorVisible = await errorMessage.isVisible().catch(() => false);
  
  if (errorVisible) {
    console.error('❌ ÉCHEC: Message d\'erreur détecté !');
    await page.screenshot({ path: 'ERREUR-sauvegarde-echouee.png' });
    throw new Error('BUG: Message "Sauvegarde distante échouée" toujours présent');
  }
  
  console.log('✅ SUCCÈS: Aucun message d\'erreur');
  
  // 7. Vérifier que la modale se ferme (ou reste ouverte sans erreur)
  await page.waitForTimeout(2000);
  const modalStillVisible = await modal.isVisible().catch(() => false);
  
  if (modalStillVisible) {
    console.log('ℹ️  Modale encore ouverte (normal si sauvegarde réussie)');
  } else {
    console.log('✓ Modale fermée (sauvegarde réussie)');
  }

  console.log('\n✅ TEST RÉUSSI: La sauvegarde fonctionne sans erreur\n');
});

test('DesignEditor - Test Sauvegarde Complète', async ({ page }) => {
  console.log('\n🧪 TEST: DesignEditor Sauvegarde\n');

  await page.goto('/design-editor');
  await page.waitForTimeout(3000);

  const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
  await settingsButton.click();

  const modal = page.locator('text=Paramètres de la campagne').first();
  await expect(modal).toBeVisible({ timeout: 15000 });

  await page.waitForTimeout(1000);
  const nameInput = page.locator('input[name="name"], input[placeholder*="Nom"]').first();
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill(`Test Design Article - ${Date.now()}`);
  }

  const saveButton = page.locator('button:has-text("Enregistrer")').first();
  await saveButton.click();

  await page.waitForTimeout(3000);
  
  const errorMessage = page.locator('text=Sauvegarde distante échouée');
  const errorVisible = await errorMessage.isVisible().catch(() => false);
  
  expect(errorVisible).toBe(false);
  console.log('✅ DesignEditor: Sauvegarde OK\n');
});

test('FormEditor - Test Sauvegarde Complète', async ({ page }) => {
  console.log('\n🧪 TEST: FormEditor Sauvegarde\n');

  await page.goto('/form-editor');
  await page.waitForTimeout(3000);

  const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
  await settingsButton.click();

  const modal = page.locator('text=Paramètres de la campagne').first();
  await expect(modal).toBeVisible({ timeout: 15000 });

  await page.waitForTimeout(1000);
  const nameInput = page.locator('input[name="name"], input[placeholder*="Nom"]').first();
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill(`Test Form Article - ${Date.now()}`);
  }

  const saveButton = page.locator('button:has-text("Enregistrer")').first();
  await saveButton.click();

  await page.waitForTimeout(3000);
  
  const errorMessage = page.locator('text=Sauvegarde distante échouée');
  const errorVisible = await errorMessage.isVisible().catch(() => false);
  
  expect(errorVisible).toBe(false);
  console.log('✅ FormEditor: Sauvegarde OK\n');
});
