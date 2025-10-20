import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour l'audit WYSIWYG
 */
export default defineConfig({
  testDir: './tests',
  
  // Timeout global
  timeout: 120000, // 2 minutes par test
  
  // Nombre de tentatives en cas d'échec
  retries: 1,
  
  // Parallélisation
  workers: 1, // Séquentiel pour éviter les conflits
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Configuration globale
  use: {
    // Base URL
    baseURL: 'http://localhost:8080',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Vidéos
    video: 'retain-on-failure',
    
    // Trace
    trace: 'retain-on-failure',
    
    // Timeout des actions
    actionTimeout: 10000,
    
    // Timeout de navigation
    navigationTimeout: 30000,
  },

  // Projets (différents navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    }
  ],

  // Serveur de développement
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
