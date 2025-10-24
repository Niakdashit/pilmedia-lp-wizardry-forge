import { test, expect } from '@playwright/test';

/**
 * Test de Debug - Capture des Logs Console
 */

test('Debug - Capturer tous les logs console lors de la sauvegarde', async ({ page }) => {
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  
  // Capturer TOUS les logs console
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      consoleErrors.push(`[ERROR] ${text}`);
      console.error(`🔴 [ERROR] ${text}`);
    } else if (type === 'log') {
      consoleLogs.push(`[LOG] ${text}`);
      console.log(`📝 [LOG] ${text}`);
    } else if (type === 'warning') {
      consoleLogs.push(`[WARN] ${text}`);
      console.log(`⚠️  [WARN] ${text}`);
    }
  });

  console.log('\n🔍 DÉBUT DU TEST DEBUG\n');

  // 1. Aller sur FormEditor
  await page.goto('/form-editor');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('✓ FormEditor chargé\n');

  // 2. Cliquer sur Paramètres
  const settingsButton = page.locator('button').filter({ hasText: 'Paramètres' }).first();
  await settingsButton.click();
  console.log('✓ Clic sur Paramètres\n');
  await page.waitForTimeout(2000);

  // 3. Vérifier que la modale est ouverte
  const modal = page.locator('text=Paramètres de la campagne').first();
  await expect(modal).toBeVisible({ timeout: 15000 });
  console.log('✓ Modale ouverte\n');

  // 4. Remplir le nom
  await page.waitForTimeout(1000);
  const nameInput = page.locator('input[name="name"], input[placeholder*="Nom"]').first();
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill(`DEBUG TEST - ${Date.now()}`);
    console.log('✓ Nom rempli\n');
  }

  // 5. Cliquer sur Enregistrer
  const saveButton = page.locator('button:has-text("Enregistrer")').first();
  await saveButton.click();
  console.log('✓ Clic sur Enregistrer\n');

  // 6. Attendre et observer
  await page.waitForTimeout(5000);

  // 7. Afficher TOUS les logs capturés
  console.log('\n📊 RÉSUMÉ DES LOGS CONSOLE:\n');
  console.log('='.repeat(80));
  
  if (consoleLogs.length > 0) {
    console.log('\n📝 LOGS NORMAUX:');
    consoleLogs.forEach(log => console.log(log));
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n🔴 ERREURS:');
    consoleErrors.forEach(err => console.log(err));
  }
  
  console.log('\n' + '='.repeat(80));

  // 8. Vérifier le message d'erreur
  const errorMessage = page.locator('text=Sauvegarde distante échouée');
  const errorVisible = await errorMessage.isVisible().catch(() => false);
  
  if (errorVisible) {
    console.log('\n❌ MESSAGE D\'ERREUR DÉTECTÉ !');
    await page.screenshot({ path: 'debug-error-screenshot.png', fullPage: true });
    
    // Analyser les logs pour trouver la cause
    const hasEmptyId = consoleLogs.some(log => log.includes('effectiveCampaignId: ""') || log.includes('effectiveCampaignId:  '));
    const hasNullRealId = consoleLogs.some(log => log.includes('realId after resolve: null'));
    const hasAuthError = consoleErrors.some(err => err.includes('authentifié'));
    
    console.log('\n🔍 ANALYSE:');
    if (hasEmptyId) console.log('  - effectiveCampaignId est VIDE');
    if (hasNullRealId) console.log('  - realId est NULL après resolve');
    if (hasAuthError) console.log('  - Problème d\'authentification');
    
    // Chercher les logs spécifiques
    const campaignIdLogs = consoleLogs.filter(log => 
      log.includes('campaignId') || 
      log.includes('effectiveCampaignId') ||
      log.includes('realId')
    );
    
    if (campaignIdLogs.length > 0) {
      console.log('\n📌 LOGS LIÉS À campaignId:');
      campaignIdLogs.forEach(log => console.log('  ' + log));
    }
  } else {
    console.log('\n✅ PAS DE MESSAGE D\'ERREUR - SUCCÈS !');
  }

  console.log('\n🔍 FIN DU TEST DEBUG\n');
});
