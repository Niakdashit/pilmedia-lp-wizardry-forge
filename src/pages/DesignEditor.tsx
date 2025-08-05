import React from 'react';
import { ArrowLeft, Palette, Type, Image, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const DesignEditor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/campaigns" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour aux campagnes</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Éditeur de Design</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              Aperçu
            </button>
            <button className="px-4 py-2 bg-brand-gradient text-white rounded-md hover:opacity-90 transition-opacity">
              Publier
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Outils de Design</h2>
            
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-md bg-brand-gradient text-white">
                <Type className="w-5 h-5" />
                <span>Texte et Typographie</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <Palette className="w-5 h-5" />
                <span>Couleurs et Thèmes</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <Image className="w-5 h-5" />
                <span>Images et Assets</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <Layers className="w-5 h-5" />
                <span>Mise en Page</span>
              </button>
            </div>
          </div>

          {/* Propriétés */}
          <div className="flex-1 p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Propriétés du Texte</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Police</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option>Inter</option>
                  <option>Helvetica</option>
                  <option>Arial</option>
                  <option>Georgia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
                <input 
                  type="range" 
                  min="12" 
                  max="72" 
                  defaultValue="16"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    defaultValue="#000000"
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    defaultValue="#000000"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <div className="flex gap-2">
                  <button className="flex-1 p-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    <strong>B</strong>
                  </button>
                  <button className="flex-1 p-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    <em>I</em>
                  </button>
                  <button className="flex-1 p-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    <u>U</u>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de travail principale */}
        <div className="flex-1 bg-gray-100 p-8">
          <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur de Design</h2>
              <p className="text-gray-600 mb-6">
                Créez et personnalisez vos designs de campagne avec nos outils intuitifs. 
                Sélectionnez un outil dans la barre latérale pour commencer.
              </p>
              <div className="text-sm text-gray-500">
                Fonctionnalités disponibles :
                <ul className="mt-2 space-y-1">
                  <li>• Édition de texte avancée</li>
                  <li>• Gestion des couleurs et thèmes</li>
                  <li>• Import d'images et assets</li>
                  <li>• Mise en page responsive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;