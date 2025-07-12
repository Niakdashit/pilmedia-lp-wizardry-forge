import React, { useState } from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface CodeTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const CodeTab: React.FC<CodeTabProps> = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'html' | 'javascript'>('css');

  const codeTabsData = [
    { id: 'css' as const, label: 'CSS', icon: '🎨' },
    { id: 'html' as const, label: 'HTML', icon: '📄' },
    { id: 'javascript' as const, label: 'JavaScript', icon: '⚡' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code personnalisé et tags</h3>
        
        {/* Code Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {codeTabsData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeCodeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="space-y-4">
          {activeCodeTab === 'css' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSS personnalisé
              </label>
              <textarea
                placeholder={`/* Ajoutez votre CSS personnalisé ici */
.custom-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.custom-button:hover {
  transform: translateY(-2px);
}`}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {activeCodeTab === 'html' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML personnalisé
              </label>
              <textarea
                placeholder={`<!-- Ajoutez votre HTML personnalisé ici -->
<div class="custom-banner">
  <h2>Titre personnalisé</h2>
  <p>Description avec du contenu HTML riche</p>
  <button class="custom-button">Action</button>
</div>`}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {activeCodeTab === 'javascript' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JavaScript personnalisé
              </label>
              <textarea
                placeholder={`// Ajoutez votre JavaScript personnalisé ici
document.addEventListener('DOMContentLoaded', function() {
  // Code d'initialisation
  console.log('Campaign loaded');
  
  // Exemple d'interaction
  const customButton = document.querySelector('.custom-button');
  if (customButton) {
    customButton.addEventListener('click', function() {
      // Logique personnalisée
      alert('Bouton personnalisé cliqué !');
    });
  }
});`}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
          Appliquer
        </button>
      </div>

      {/* Tags Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-800 mb-3">Tags et variables</h4>
        <p className="text-sm text-gray-600 mb-4">
          Utilisez ces tags pour insérer du contenu dynamique dans vos templates
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <code className="text-sm font-mono">{"{{campaign.title}}"}</code>
            <span className="text-xs text-gray-500">Titre de la campagne</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <code className="text-sm font-mono">{"{{campaign.description}}"}</code>
            <span className="text-xs text-gray-500">Description</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <code className="text-sm font-mono">{"{{user.email}}"}</code>
            <span className="text-xs text-gray-500">Email utilisateur</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <code className="text-sm font-mono">{"{{date.now}}"}</code>
            <span className="text-xs text-gray-500">Date actuelle</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeTab;