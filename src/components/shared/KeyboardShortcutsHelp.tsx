import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command, Option } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  shortcuts?: Record<string, string>;
  className?: string;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ 
  // shortcuts parameter unused - using default shortcuts 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Détecter le système d'exploitation
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  
  // Raccourcis par défaut si non fournis
  // Using inline shortcuts instead of variable
  // Use shortcutsData directly in the UI below
  
  // Fonction pour formater les raccourcis avec des icônes
  const formatShortcut = (shortcut: string) => {
    const parts = shortcut.split('+').map(part => part.trim());
    return parts.map((part, index) => {
      let displayPart = part;
      let icon = null;
      
      if (part === 'Cmd' && isMac) {
        icon = <Command className="w-3 h-3" />;
        displayPart = '';
      } else if (part === 'Ctrl' && !isMac) {
        displayPart = 'Ctrl';
      } else if (part === 'Alt' || part === 'Option') {
        if (isMac) {
          icon = <Option className="w-3 h-3" />;
          displayPart = '';
        } else {
          displayPart = 'Alt';
        }
      } else if (part === 'Shift') {
        displayPart = '⇧';
      } else if (part === 'Échap' || part === 'Escape') {
        displayPart = 'Échap';
      } else if (part === 'Suppr' || part === 'Delete') {
        displayPart = 'Suppr';
      } else if (part === 'Espace' || part === 'Space') {
        displayPart = 'Espace';
      } else if (['ArrowLeft', 'Left', '←'].includes(part)) {
        displayPart = '←';
      } else if (['ArrowRight', 'Right', '→'].includes(part)) {
        displayPart = '→';
      } else if (['ArrowUp', 'Up', '↑'].includes(part)) {
        displayPart = '↑';
      } else if (['ArrowDown', 'Down', '↓'].includes(part)) {
        displayPart = '↓';
      }
      
      return (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400 mx-1">+</span>}
          <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-300 rounded text-gray-800">
            {icon}
            {displayPart}
          </kbd>
        </React.Fragment>
      );
    });
  };
  
  // Grouper les raccourcis par catégorie
  const groupedShortcuts = {
    'Édition': [
      [`${modifierKey}+S`, 'Sauvegarder la campagne'],
      [`${modifierKey}+Z`, 'Annuler'],
      [`${modifierKey}+Y`, 'Rétablir'],
      [`${modifierKey}+C`, 'Copier l\'élément sélectionné'],
      [`${modifierKey}+V`, 'Coller l\'élément'],
      ['Suppr', 'Supprimer l\'élément sélectionné'],
      ['Échap', 'Désélectionner tout']
    ],
    'Affichage': [
      [`${modifierKey}+P`, 'Prévisualiser la campagne'],
      ['G', 'Basculer la grille'],
      ['+', 'Zoomer'],
      ['-', 'Dézoomer'],
      ['0', 'Zoom 100%'],
      ['1', 'Ajuster à l\'écran']
    ],
    'Éléments': [
      [`${modifierKey}+G`, 'Grouper des éléments'],
      [`${modifierKey}+Shift+G`, 'Dégrouper des éléments'],
      ['Alt+Shift+L', 'Verrouiller un élément'],
      [`${modifierKey}+Shift+J`, 'Justifier au niveau des éléments'],
      [`${modifierKey}+]`, 'Faire avancer les éléments d\'un niveau'],
      [`${modifierKey}+[`, 'Faire reculer les éléments d\'un niveau'],
      [`Alt+${modifierKey}+]`, 'Mettre les éléments au premier plan'],
      [`Alt+${modifierKey}+[`, 'Mettre les éléments à l\'arrière-plan'],
      [`Shift+${modifierKey}+T`, 'Ranger les éléments'],
      ['Tab', 'Sélectionner l\'élément suivant'],
      ['Shift+Tab', 'Sélectionner l\'élément précédent']
    ],
    'Déplacement': [
      ['←', 'Aller à gauche (petit)'],
      ['→', 'Aller à droite (petit)'],
      ['↑', 'Déplacer vers le haut (petit)'],
      ['↓', 'Déplacer vers le bas (petit)'],
      ['Shift+←', 'Aller à gauche (grand)'],
      ['Shift+→', 'Déplacer vers la droite (grand)'],
      ['Shift+↑', 'Déplacer vers le haut (grand)'],
      ['Shift+↓', 'Déplacer vers le bas (grand)']
    ],
    'Rotation': [
      [',', 'Tourner à gauche (petit)'],
      ['.', 'Tourner à droite (petit)'],
      ['Shift+,', 'Tourner à gauche (grand)'],
      ['Shift+.', 'Tourner à droite (grand)']
    ],
    'Redimensionnement': [
      [`${modifierKey}+←`, 'Redimensionner à gauche (petit)'],
      [`${modifierKey}+→`, 'Redimensionner à droite (petit)'],
      [`${modifierKey}+↑`, 'Redimensionner vers le haut (petit)'],
      [`${modifierKey}+↓`, 'Redimensionner vers le bas (petit)'],
      [`Shift+${modifierKey}+←`, 'Redimensionner à gauche (grand)'],
      [`Shift+${modifierKey}+→`, 'Redimensionner à droite (grand)'],
      [`Shift+${modifierKey}+↑`, 'Redimensionner vers le haut (grand)'],
      [`Shift+${modifierKey}+↓`, 'Redimensionner vers le bas (grand)']
    ],
    'Texte': [
      [`Shift+${modifierKey}+F`, 'Ouvrir le menu des polices'],
      [`${modifierKey}+F`, 'Chercher et remplacer'],
      [`${modifierKey}+B`, 'Mettre le texte en gras'],
      [`${modifierKey}+I`, 'Mettre le texte en italique'],
      [`${modifierKey}+U`, 'Souligner'],
      [`Shift+${modifierKey}+K`, 'Majuscules'],
      [`Shift+${modifierKey}+L`, 'Aligner à gauche'],
      [`Shift+${modifierKey}+C`, 'Centrer'],
      [`Shift+${modifierKey}+R`, 'Aligner à droite'],
      [`Shift+${modifierKey}+,`, 'Diminuer la taille de police d\'un point'],
      [`Shift+${modifierKey}+.`, 'Augmenter la taille de police d\'un point'],
      [`Alt+${modifierKey}+↓`, 'Diminuer l\'interligne'],
      [`Alt+${modifierKey}+↑`, 'Augmenter l\'interligne'],
      [`Alt+${modifierKey}+,`, 'Diminuer l\'espacement des lettres'],
      [`Alt+${modifierKey}+.`, 'Augmenter l\'espacement des lettres'],
      [`${modifierKey}+Shift+H`, 'Ancrer le texte en haut'],
      [`${modifierKey}+Shift+M`, 'Ancrer le texte au milieu'],
      [`${modifierKey}+Shift+B`, 'Ancrer le texte en bas'],
      [`${modifierKey}+Shift+7`, 'Liste numérotée'],
      [`${modifierKey}+Shift+8`, 'Liste à puces'],
      [`Alt+${modifierKey}+C`, 'Copier le style de texte'],
      [`Alt+${modifierKey}+V`, 'Coller le style de texte']
    ],
    'Outils (Futur)': [
      ['Espace', 'Mode main'],
      ['V', 'Outil de sélection'],
      ['T', 'Outil texte'],
      ['R', 'Outil rectangle'],
      ['O', 'Outil cercle'],
      ['I', 'Outil image']
    ]
  };

  return (
    <>
      {/* Bouton d'aide */}
      <button
        onClick={() => setIsOpen(true)}
        className={`hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
        aria-hidden="true"
        title="Raccourcis clavier"
      >
        <Keyboard className="w-4 h-4" />
        <span className="hidden sm:inline">Raccourcis</span>
      </button>

      {/* Modal des raccourcis */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Keyboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Raccourcis clavier
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isMac ? 'macOS' : 'Windows'} - Optimisé pour votre système
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-8">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        {category}
                        {category.includes('Futur') && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                            Bientôt disponible
                          </span>
                        )}
                      </h3>
                      <div className="grid gap-3">
                        {shortcuts.map(([shortcut, description]) => (
                          <div
                            key={shortcut}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm text-gray-700 font-medium">
                              {description}
                            </span>
                            <div className="flex items-center gap-1">
                              {formatShortcut(shortcut)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Astuce :</strong> Les raccourcis s'adaptent automatiquement à votre système d'exploitation. 
                    Sur Mac, utilisez <kbd className="px-1 py-0.5 text-xs bg-blue-100 rounded">Cmd</kbd> au lieu de 
                    <kbd className="px-1 py-0.5 text-xs bg-blue-100 rounded ml-1">Ctrl</kbd>.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Appuyez sur <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Échap</kbd> pour fermer
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Compris
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcutsHelp;
