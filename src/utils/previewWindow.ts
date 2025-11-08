
export interface PreviewWindowConfig {
  campaign: any;
  title: string;
  width?: number;
  height?: number;
}

export class PreviewWindowManager {
  private static openWindows: Map<string, Window> = new Map();

  static openPreviewWindow(config: PreviewWindowConfig): void {
    const { campaign, title, width = 1200, height = 800 } = config;
    
    // Calculer la position pour centrer la fenêtre
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    
    const windowFeatures = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=yes',
      'scrollbars=yes',
      'status=no',
      'toolbar=no',
      'menubar=no',
      'location=no'
    ].join(',');

    // Fermer la fenêtre existante si elle existe
    const existingWindow = this.openWindows.get(campaign.id);
    if (existingWindow && !existingWindow.closed) {
      existingWindow.close();
    }

    // Ouvrir une nouvelle fenêtre
    const newWindow = window.open('', `preview_${campaign.id}`, windowFeatures);
    
    if (newWindow) {
      this.openWindows.set(campaign.id, newWindow);
      
      // Générer le HTML pour la nouvelle fenêtre
      const previewHtml = this.generatePreviewHTML(campaign, title);
      
      newWindow.document.write(previewHtml);
      newWindow.document.close();
      
      // Nettoyer quand la fenêtre est fermée
      newWindow.addEventListener('beforeunload', () => {
        this.openWindows.delete(campaign.id);
      });
    } else {
      console.error('Impossible d\'ouvrir la fenêtre d\'aperçu. Vérifiez que les popups ne sont pas bloqués.');
      alert('Impossible d\'ouvrir la fenêtre d\'aperçu. Veuillez autoriser les popups pour ce site.');
    }
  }

  private static generatePreviewHTML(campaign: any, title: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: system-ui, -apple-system, sans-serif;
            background: #f8fafc;
        }
        .preview-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .preview-header {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .preview-content {
            flex: 1;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .device-frame {
            max-width: 100%;
            max-height: 100%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <div>
                <h1 class="text-lg font-semibold text-gray-900">${title}</h1>
                <p class="text-sm text-gray-500">Aperçu dans une fenêtre indépendante</p>
            </div>
            <button onclick="window.close()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                Fermer
            </button>
        </div>
        <div class="preview-content">
            <div class="device-frame">
                <div id="campaign-preview">
                    <div class="p-8 text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="mt-4 text-gray-600">Chargement de l'aperçu...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Données de la campagne injectées
        window.campaignData = ${JSON.stringify(campaign)};
        
        // Génération d'aperçu unifié avec WheelConfigService
        setTimeout(() => {
            const previewElement = document.getElementById('campaign-preview');
            if (previewElement && window.campaignData) {
                const campaign = window.campaignData;
                
                // Configuration unifiée de la roue via le service
                const wheelConfig = {
                    borderStyle: campaign.design?.wheelBorderStyle || campaign.design?.wheelConfig?.borderStyle || 'classic',
                    borderColor: campaign.design?.wheelConfig?.borderColor || '#E0004D',
                    scale: campaign.design?.wheelConfig?.scale || 1,
                    customColors: campaign.design?.customColors || {
                        primary: campaign.design?.brandColors?.primary || '#8b5cf6',
                        secondary: campaign.design?.brandColors?.secondary || '#a78bfa',
                        accent: campaign.design?.brandColors?.accent || '#c4b5fd'
                    }
                };
                
                const colors = wheelConfig.customColors;
                
                // Rendu spécial pour Quiz avec couleurs extraites du logo
                if (campaign.type === 'quiz') {
                    previewElement.innerHTML = \`
                        <div class="p-8 min-h-[600px] flex items-center justify-center" style="background: linear-gradient(135deg, \${colors.secondary}20, \${colors.primary}20);">
                            <div class="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full" style="border: 2px solid \${colors.primary};">
                                <div class="mb-6">
                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Question 1 sur 3</span>
                                        <span>Quiz Interactif</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="h-2 rounded-full transition-all duration-300" style="background-color: \${colors.primary}; width: 33%;"></div>
                                    </div>
                                </div>
                                
                                <h2 class="text-2xl font-bold mb-6" style="color: \${colors.primary};">\${campaign.name}</h2>
                                <h3 class="text-xl font-semibold mb-6 text-gray-800">Quelle est votre couleur préférée ?</h3>
                                
                                <div class="space-y-3 mb-6">
                                    <button class="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]" style="border-color: \${colors.primary}; background-color: rgba(255, 255, 255, 0.8);">
                                        <div class="flex items-center">
                                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" style="border-color: \${colors.primary};">
                                                <span class="text-sm font-medium">A</span>
                                            </div>
                                            Rouge
                                        </div>
                                    </button>
                                    <button class="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]" style="border-color: \${colors.primary}; background-color: rgba(255, 255, 255, 0.8);">
                                        <div class="flex items-center">
                                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" style="border-color: \${colors.primary};">
                                                <span class="text-sm font-medium">B</span>
                                            </div>
                                            Bleu
                                        </div>
                                    </button>
                                    <button class="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]" style="border-color: \${colors.primary}; background-color: rgba(255, 255, 255, 0.8);">
                                        <div class="flex items-center">
                                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" style="border-color: \${colors.primary};">
                                                <span class="text-sm font-medium">C</span>
                                            </div>
                                            Vert
                                        </div>
                                    </button>
                                </div>
                                
                                <button class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:opacity-90" style="background-color: \${colors.accent}; color: \${colors.primary};">
                                    Question suivante
                                </button>
                            </div>
                        </div>
                    \`;
                } else if (campaign.type === 'wheel') {
                    // Rendu unifié pour la roue avec découpage cohérent
                    const borderStyles = {
                        classic: 'border-4 shadow-lg',
                        neon: 'border-2 shadow-[0_0_20px]',
                        golden: 'border-4 shadow-[0_0_30px_gold]',
                        minimal: 'border border-gray-300'
                    };
                    
                    const wheelSize = Math.round(240 * wheelConfig.scale);
                    const croppedStyle = 'transform: translateY(60%); margin-bottom: -30%;';
                    
                    previewElement.innerHTML = \`
                        <div class="relative w-full h-[600px] overflow-hidden flex items-end justify-center" style="background: linear-gradient(135deg, \${wheelConfig.customColors.secondary}20, \${wheelConfig.customColors.primary}20);">
                            <!-- Roue coupée comme dans l'éditeur -->
                            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2" style="\${croppedStyle}">
                                <div class="relative flex items-center justify-center" style="width: \${wheelSize}px; height: \${wheelSize}px;">
                                    <!-- Cercle de roue simulé -->
                                    <div class="w-full h-full rounded-full \${borderStyles[wheelConfig.borderStyle] || borderStyles.classic} relative overflow-hidden" 
                                         style="background: conic-gradient(from 0deg, \${wheelConfig.customColors.primary}, white, \${wheelConfig.customColors.primary}, white, \${wheelConfig.customColors.primary}, white); border-color: \${wheelConfig.borderColor}; box-shadow: 0 0 20px \${wheelConfig.borderColor}40;">
                                        
                                        <!-- Segments simulés -->
                                        <div class="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                                        
                                        <!-- Bouton central -->
                                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30" 
                                             style="background-color: \${wheelConfig.borderColor}; box-shadow: 0 4px 14px \${wheelConfig.borderColor}40;">
                                            GO
                                        </div>
                                        
                                        <!-- Flèche indicatrice -->
                                        <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white z-10"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Interface supérieure -->
                            <div class="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
                                <h2 class="text-2xl font-bold mb-4" style="color: \${wheelConfig.customColors.primary};">\${campaign.name || 'Roue de la Fortune'}</h2>
                                <p class="text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">Tentez votre chance !</p>
                            </div>
                        </div>
                    \`;
                } else {
                    // Rendu par défaut pour autres types de jeux
                    previewElement.innerHTML = \`
                        <div class="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[600px] flex items-center justify-center">
                            <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">\${campaign.name}</h2>
                                <div class="mb-6">
                                    <div class="w-24 h-24 bg-gradient-to-br rounded-full mx-auto mb-4 flex items-center justify-center" style="background: linear-gradient(135deg, \${wheelConfig.customColors.primary}, \${wheelConfig.customColors.secondary});">
                                        <span class="text-white text-2xl font-bold">\${campaign.type?.toUpperCase()}</span>
                                    </div>
                                    <p class="text-gray-600">Type de jeu: \${campaign.type || 'Non défini'}</p>
                                </div>
                                <button class="w-full font-semibold py-3 px-6 rounded-lg transition-colors" style="background-color: \${wheelConfig.customColors.primary}; color: white;">
                                    Jouer maintenant !
                                </button>
                                <p class="text-xs text-gray-500 mt-4">Aperçu - Fenêtre indépendante</p>
                            </div>
                        </div>
                    \`;
                }
            }
        }, 1000);
    </script>
</body>
</html>`;
  }

  static closeAllWindows(): void {
    this.openWindows.forEach((window) => {
      if (!window.closed) {
        window.close();
      }
    });
    this.openWindows.clear();
  }
}
