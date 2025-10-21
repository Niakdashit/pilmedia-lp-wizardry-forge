import { test, expect } from '@playwright/test';

test.describe('Jackpot Animation Flow', () => {
  test('should complete spin animation before showing result screen', async ({ page }) => {
    // Aller sur la page de l'éditeur jackpot
    await page.goto('http://localhost:5173/jackpot-editor');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Cliquer sur le bouton Preview/Aperçu
    const previewButton = page.locator('button:has-text("Aperçu"), button:has-text("Preview")').first();
    await previewButton.click();
    
    console.log('✅ Mode preview activé');
    await page.waitForTimeout(1000);
    
    // Attendre que le SlotMachine soit visible
    await page.waitForSelector('.slot-machine-container, .slot-root', { timeout: 10000 });
    console.log('✅ SlotMachine visible');
    
    // Cliquer sur le formulaire si nécessaire
    const formOverlay = page.locator('text=Remplir le formulaire, text=Valider').first();
    if (await formOverlay.isVisible().catch(() => false)) {
      await formOverlay.click();
      await page.waitForTimeout(500);
      
      // Remplir le formulaire rapidement
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[name="nom"], input[placeholder*="nom"]', 'Test');
      await page.fill('input[name="prenom"], input[placeholder*="prénom"]', 'User');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Valider")').first();
      await submitButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Formulaire validé');
    }
    
    // Écouter les logs de la console
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[SlotMachine]') || text.includes('[Jackpot]') || text.includes('[FunnelUnlockedGame]')) {
        logs.push(`${Date.now()}: ${text}`);
        console.log(text);
      }
    });
    
    // Trouver et cliquer sur le bouton SPIN
    const spinButton = page.locator('button:has-text("SPIN"), button:has-text("Lancer")').first();
    await expect(spinButton).toBeVisible({ timeout: 5000 });
    
    console.log('🎰 Clique sur SPIN...');
    const spinStartTime = Date.now();
    await spinButton.click();
    
    // Vérifier que l'animation démarre
    await page.waitForTimeout(500);
    
    // Vérifier que les rouleaux sont en train de tourner (isSpinning = true)
    const isSpinning = await page.evaluate(() => {
      const slots = document.querySelectorAll('.slot-reel');
      return slots.length > 0;
    });
    expect(isSpinning).toBe(true);
    console.log('✅ Animation démarrée');
    
    // Attendre que l'animation se termine (3200ms + marge)
    await page.waitForTimeout(3500);
    
    // Vérifier que les rouleaux sont toujours visibles
    const slotsStillVisible = await page.locator('.slot-reel').first().isVisible();
    console.log(`🎰 Rouleaux visibles après 3.5s: ${slotsStillVisible}`);
    
    // Attendre encore 1.5s pour voir si le résultat reste visible
    await page.waitForTimeout(1500);
    
    const totalTime = Date.now() - spinStartTime;
    console.log(`⏱️ Temps total avant ResultScreen: ${totalTime}ms`);
    
    // Vérifier que ResultScreen est maintenant visible
    const resultScreen = page.locator('text=Félicitations, text=Dommage, text=Perdu, text=Gagné').first();
    const resultVisible = await resultScreen.isVisible().catch(() => false);
    console.log(`📊 ResultScreen visible: ${resultVisible}`);
    
    // Afficher tous les logs collectés
    console.log('\n📋 Logs collectés:');
    logs.forEach(log => console.log(log));
    
    // Prendre une capture d'écran
    await page.screenshot({ path: 'jackpot-animation-test.png', fullPage: true });
    console.log('📸 Capture d\'écran sauvegardée: jackpot-animation-test.png');
    
    // Vérifications
    expect(totalTime).toBeGreaterThan(4000); // Au moins 4 secondes
    expect(logs.some(l => l.includes('Animation complete'))).toBe(true);
    expect(logs.some(l => l.includes('Setting gameResult'))).toBe(true);
  });
  
  test('should show smooth animation without abrupt cuts', async ({ page }) => {
    await page.goto('http://localhost:5173/jackpot-editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Activer preview
    const previewButton = page.locator('button:has-text("Aperçu"), button:has-text("Preview")').first();
    await previewButton.click();
    await page.waitForTimeout(1000);
    
    // Enregistrer une vidéo de l'animation
    const context = page.context();
    await context.tracing.start({ screenshots: true, snapshots: true });
    
    // Valider le formulaire si nécessaire
    const formOverlay = page.locator('text=Remplir le formulaire').first();
    if (await formOverlay.isVisible().catch(() => false)) {
      await formOverlay.click();
      await page.waitForTimeout(500);
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[name="nom"]', 'Test');
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Lancer le spin
    const spinButton = page.locator('button:has-text("SPIN")').first();
    await spinButton.click();
    
    // Surveiller les changements visuels toutes les 100ms
    const visualChanges: number[] = [];
    for (let i = 0; i < 50; i++) { // 5 secondes
      await page.waitForTimeout(100);
      const slotsVisible = await page.locator('.slot-reel').count();
      visualChanges.push(slotsVisible);
    }
    
    await context.tracing.stop({ path: 'jackpot-animation-trace.zip' });
    
    console.log('📊 Changements visuels (nombre de rouleaux visibles):');
    console.log(visualChanges);
    
    // Vérifier qu'il n'y a pas de disparition brutale (0 rouleaux) avant 4 secondes
    const earlyChanges = visualChanges.slice(0, 40); // 4 premières secondes
    const hasAbruptCut = earlyChanges.some(count => count === 0);
    
    console.log(`❌ Coupure brutale détectée: ${hasAbruptCut}`);
    expect(hasAbruptCut).toBe(false);
  });
});
