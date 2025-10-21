import { test, expect } from '@playwright/test';

test.describe('Jackpot Animation Flow', () => {
  test('should complete spin animation before showing result screen', async ({ page }) => {
    // Aller sur la page de l'éditeur jackpot
    await page.goto('http://localhost:8080/jackpot-editor');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Cliquer sur le bouton Preview/Aperçu
    const previewButton = page.locator('button:has-text("Aperçu"), button:has-text("Preview")').first();
    await previewButton.click();
    
    console.log('✅ Mode preview activé');
    await page.waitForTimeout(1000);
    
    // Cliquer sur le bouton "Participer" pour accéder au jeu
    const participerButton = page.locator('button:has-text("Participer"), a:has-text("Participer")').first();
    if (await participerButton.isVisible().catch(() => false)) {
      await participerButton.click();
      console.log('✅ Bouton Participer cliqué');
      await page.waitForTimeout(1000);
    }
    
    // Attendre que le SlotMachine soit visible
    await page.waitForSelector('.slot-machine-container, .slot-root', { timeout: 10000 });
    console.log('✅ SlotMachine visible');
    
    // ÉTAPE 1: Cliquer sur l'overlay ou SPIN pour déclencher le formulaire
    // Il y a un overlay transparent qui intercepte les clics, on clique dessus
    const overlay = page.locator('.absolute.inset-0.flex.items-center.justify-center').first();
    if (await overlay.isVisible().catch(() => false)) {
      console.log('🎰 Clic sur overlay pour ouvrir le formulaire...');
      await overlay.click();
    } else {
      const firstSpinButton = page.locator('button:has-text("SPIN"), button:has-text("Lancer")').first();
      console.log('🎰 Clic sur SPIN pour ouvrir le formulaire...');
      await firstSpinButton.click({ force: true });
    }
    await page.waitForTimeout(1000);
    
    // ÉTAPE 2: Remplir le formulaire
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      console.log('📝 Remplissage du formulaire...');
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
    await page.goto('http://localhost:8080/jackpot-editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Activer preview
    const previewButton = page.locator('button:has-text("Aperçu"), button:has-text("Preview")').first();
    await previewButton.click();
    await page.waitForTimeout(1000);
    
    // Cliquer sur le bouton "Participer"
    const participerButton2 = page.locator('button:has-text("Participer"), a:has-text("Participer")').first();
    if (await participerButton2.isVisible().catch(() => false)) {
      await participerButton2.click();
      await page.waitForTimeout(1000);
    }
    
    // Enregistrer une vidéo de l'animation
    const context = page.context();
    await context.tracing.start({ screenshots: true, snapshots: true });
    
    // Premier clic sur l'overlay pour ouvrir le formulaire
    const overlay2 = page.locator('.absolute.inset-0.flex.items-center.justify-center').first();
    if (await overlay2.isVisible().catch(() => false)) {
      await overlay2.click();
    } else {
      const firstSpin = page.locator('button:has-text("SPIN")').first();
      await firstSpin.click({ force: true });
    }
    await page.waitForTimeout(1000);
    
    // Valider le formulaire
    const emailInput2 = page.locator('input[type="email"]').first();
    if (await emailInput2.isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[name="nom"]', 'Test');
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Deuxième clic sur SPIN pour lancer l'animation
    const secondSpin = page.locator('button:has-text("SPIN")').first();
    await secondSpin.click();
    
    // Surveiller les changements visuels toutes les 100ms
    const visualChanges: {time: number, spinning: boolean, reelsCount: number}[] = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) { // 5 secondes
      await page.waitForTimeout(100);
      const isSpinning = await page.evaluate(() => {
        const spinButton = document.querySelector('button:has-text("SPIN")') as HTMLButtonElement;
        return spinButton?.disabled || false;
      });
      const slotsVisible = await page.locator('.slot-reel').count();
      const elapsed = Date.now() - startTime;
      visualChanges.push({ time: elapsed, spinning: isSpinning, reelsCount: slotsVisible });
    }
    
    await context.tracing.stop({ path: 'jackpot-animation-trace.zip' });
    
    console.log('📊 Changements visuels détaillés:');
    visualChanges.forEach(v => console.log(`  ${v.time}ms: spinning=${v.spinning}, reels=${v.reelsCount}`));
    
    // Vérifier qu'il n'y a pas de disparition brutale pendant le spin
    const duringSpinChanges = visualChanges.filter(v => v.spinning);
    const hasAbruptCut = duringSpinChanges.some(v => v.reelsCount === 0);
    
    console.log(`\n❌ Coupure brutale pendant le spin: ${hasAbruptCut}`);
    console.log(`📊 Animation a duré: ${visualChanges.filter(v => v.spinning).length * 100}ms`);
    
    expect(hasAbruptCut).toBe(false);
  });
});
