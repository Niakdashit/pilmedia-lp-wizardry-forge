import React from 'react';
import { Plus, Type, Bold, Italic, Underline } from 'lucide-react';
import type { EditorConfig, CustomText } from '../QualifioEditorLayout';
interface TextsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const TextsTab: React.FC<TextsTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const addCustomText = () => {
    const newText: CustomText = {
      id: `text-${Date.now()}`,
      content: 'Nouveau texte',
      x: 100,
      y: 100,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none'
    };
    const updatedTexts = [...(config.customTexts || []), newText];
    onConfigUpdate({
      customTexts: updatedTexts
    });
  };
  const updateCustomText = (textId: string, updates: Partial<CustomText>) => {
    const updatedTexts = config.customTexts?.map(text => text.id === textId ? {
      ...text,
      ...updates
    } : text) || [];
    onConfigUpdate({
      customTexts: updatedTexts
    });
  };
  const deleteCustomText = (textId: string) => {
    const updatedTexts = config.customTexts?.filter(text => text.id !== textId) || [];
    onConfigUpdate({
      customTexts: updatedTexts
    });
  };
  return <div className="space-y-6 py-0">
      {/* Ajouter du texte - Style Canva */}
      <div className="premium-card mx-[30px]">
        <button onClick={addCustomText} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md">
          <Type className="w-5 h-5" />
          Ajouter du texte
        </button>
      </div>

      {/* Textes par défaut */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Textes par défaut</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Contenu de l'histoire</label>
            <textarea value={config.storyText || ''} onChange={e => onConfigUpdate({
            storyText: e.target.value
          })} rows={6} placeholder="Saisissez le texte de l'histoire..." />
          </div>

          <div className="form-group-premium">
            <label>Lien éditeur</label>
            <input type="text" value={config.publisherLink || ''} onChange={e => onConfigUpdate({
            publisherLink: e.target.value
          })} placeholder="editions.flammarion.com" />
          </div>

          <div className="form-group-premium">
            <label>Description du prix</label>
            <textarea value={config.prizeText || ''} onChange={e => onConfigUpdate({
            prizeText: e.target.value
          })} rows={3} placeholder="Description du prix à gagner..." />
          </div>
        </div>
      </div>

      {/* Textes personnalisés */}
      <div className="premium-card mx-[30px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Textes personnalisés</h4>
          <button onClick={addCustomText} className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        
        {config.customTexts?.length === 0 && <p className="text-sidebar-text-muted text-sm italic">
            Aucun texte personnalisé. Cliquez sur "Ajouter" pour créer un nouveau texte éditable.
          </p>}

        <div className="space-y-4">
          {config.customTexts?.map(text => <div key={text.id} className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-sidebar-text-muted" />
                  <span className="text-sm font-medium text-sidebar-text-primary">
                    {text.content.substring(0, 20)}{text.content.length > 20 ? '...' : ''}
                  </span>
                </div>
                <button onClick={() => deleteCustomText(text.id)} className="text-red-500 hover:text-red-700 text-sm">
                  Supprimer
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group-premium">
                  <label>Contenu</label>
                  <input type="text" value={text.content} onChange={e => updateCustomText(text.id, {
                content: e.target.value
              })} placeholder="Texte à afficher" />
                </div>

                <div className="form-group-premium">
                  <label>Police</label>
                  <select value={text.fontFamily} onChange={e => updateCustomText(text.id, {
                fontFamily: e.target.value
              })}>
                    <optgroup label="Sans Serif">
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Nunito, sans-serif">Nunito</option>
                      <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                      <option value="Raleway, sans-serif">Raleway</option>
                      <option value="Ubuntu, sans-serif">Ubuntu</option>
                      <option value="Work Sans, sans-serif">Work Sans</option>
                      <option value="Fira Sans, sans-serif">Fira Sans</option>
                      <option value="Rubik, sans-serif">Rubik</option>
                      <option value="Quicksand, sans-serif">Quicksand</option>
                      <option value="Comfortaa, sans-serif">Comfortaa</option>
                      <option value="Kanit, sans-serif">Kanit</option>
                      <option value="Exo 2, sans-serif">Exo 2</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </optgroup>
                    <optgroup label="Serif">
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="Merriweather, serif">Merriweather</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Palatino, serif">Palatino</option>
                    </optgroup>
                    <optgroup label="Display">
                      <option value="Oswald, sans-serif">Oswald</option>
                      <option value="Bebas Neue, sans-serif">Bebas Neue</option>
                      <option value="Anton, sans-serif">Anton</option>
                      <option value="Fjalla One, sans-serif">Fjalla One</option>
                      <option value="Russo One, sans-serif">Russo One</option>
                      <option value="Righteous, sans-serif">Righteous</option>
                      <option value="Impact, sans-serif">Impact</option>
                      <option value="Orbitron, sans-serif">Orbitron</option>
                      <option value="Audiowide, sans-serif">Audiowide</option>
                    </optgroup>
                    <optgroup label="Handwriting & Script">
                      <option value="Dancing Script, cursive">Dancing Script</option>
                      <option value="Pacifico, cursive">Pacifico</option>
                      <option value="Lobster, cursive">Lobster</option>
                      <option value="Great Vibes, cursive">Great Vibes</option>
                      <option value="Sacramento, cursive">Sacramento</option>
                      <option value="Satisfy, cursive">Satisfy</option>
                      <option value="Cookie, cursive">Cookie</option>
                      <option value="Caveat, cursive">Caveat</option>
                      <option value="Kalam, cursive">Kalam</option>
                      <option value="Architects Daughter, cursive">Architects Daughter</option>
                      <option value="Shadows Into Light, cursive">Shadows Into Light</option>
                      <option value="Indie Flower, cursive">Indie Flower</option>
                      <option value="Permanent Marker, cursive">Permanent Marker</option>
                    </optgroup>
                    <optgroup label="Fun & Creative">
                      <option value="Fredoka One, cursive">Fredoka One</option>
                      <option value="Bungee, cursive">Bungee</option>
                      <option value="Bangers, cursive">Bangers</option>
                      <option value="Creepster, cursive">Creepster</option>
                      <option value="Amatic SC, cursive">Amatic SC</option>
                      <option value="Press Start 2P, cursive">Press Start 2P</option>
                      <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                    </optgroup>
                    <optgroup label="Monospace">
                      <option value="Anonymous Pro, monospace">Anonymous Pro</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                    </optgroup>
                    <optgroup label="Branded Style">
                      <option value="Belleza, sans-serif">Belleza</option>
                      <option value="Binate, sans-serif">Binate</option>
                      <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group-premium">
                  <label>Taille</label>
                  <input type="number" min="8" max="72" value={text.fontSize} onChange={e => updateCustomText(text.id, {
                fontSize: parseInt(e.target.value) || 16
              })} />
                </div>

                <div className="form-group-premium">
                  <label>Couleur</label>
                  <div className="color-input-group">
                    <input type="color" value={text.color} onChange={e => updateCustomText(text.id, {
                  color: e.target.value
                })} />
                    <input type="text" value={text.color} onChange={e => updateCustomText(text.id, {
                  color: e.target.value
                })} placeholder="#000000" />
                  </div>
                </div>

                <div className="form-group-premium">
                  <label>Couleur de fond (optionnel)</label>
                  <div className="color-input-group">
                    <input type="color" value={text.backgroundColor || '#ffffff'} onChange={e => updateCustomText(text.id, {
                  backgroundColor: e.target.value
                })} />
                    <input type="text" value={text.backgroundColor || ''} onChange={e => updateCustomText(text.id, {
                  backgroundColor: e.target.value
                })} placeholder="Transparent" />
                  </div>
                </div>

                <div className="form-group-premium">
                  <label>Position X</label>
                  <input type="number" value={text.x} onChange={e => updateCustomText(text.id, {
                x: parseInt(e.target.value) || 0
              })} />
                </div>

                <div className="form-group-premium">
                  <label>Position Y</label>
                  <input type="number" value={text.y} onChange={e => updateCustomText(text.id, {
                y: parseInt(e.target.value) || 0
              })} />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => updateCustomText(text.id, {
              fontWeight: text.fontWeight === 'bold' ? 'normal' : 'bold'
            })} className={`btn-icon ${text.fontWeight === 'bold' ? 'active' : ''}`}>
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => updateCustomText(text.id, {
              fontStyle: text.fontStyle === 'italic' ? 'normal' : 'italic'
            })} className={`btn-icon ${text.fontStyle === 'italic' ? 'active' : ''}`}>
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => updateCustomText(text.id, {
              textDecoration: text.textDecoration === 'underline' ? 'none' : 'underline'
            })} className={`btn-icon ${text.textDecoration === 'underline' ? 'active' : ''}`}>
                  <Underline className="w-4 h-4" />
                </button>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default TextsTab;