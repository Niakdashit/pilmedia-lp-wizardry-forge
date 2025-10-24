import { test as setup } from '@playwright/test';

/**
 * Setup d'authentification pour les tests
 * Ce fichier s'exécute avant tous les tests pour créer une session authentifiée
 */

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Aller sur la page de login
  await page.goto('/login');
  
  // Remplir le formulaire
  await page.locator('input[type="email"]').fill('test@prosplay.com');
  await page.locator('input[type="password"]').fill('testpassword123');
  
  // Cliquer sur Se connecter
  await page.locator('button:has-text("Se connecter")').click();
  
  // Attendre la navigation
  await page.waitForURL(url => {
    const urlStr = url.toString();
    return !urlStr.includes('/login');
  }, { timeout: 10000 });

  // Sauvegarder l'état d'authentification
  await page.context().storageState({ path: authFile });
});
