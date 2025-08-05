import React, { useState, useCallback } from 'react';
import { useUndoRedo, useUndoRedoShortcuts } from '../hooks/useUndoRedo';
import { UndoRedoButtons, ToolbarUndoRedoButtons } from '../components/shared/UndoRedoButtons';

/**
 * Exemple d'intégration complète du système undo/redo
 * 
 * Cet exemple montre comment intégrer la fonctionnalité undo/redo
 * dans n'importe quel composant de votre application.
 */

// Interface pour l'état de votre application
interface AppState {
  elements: Array<{
    id: string;
    type: 'text' | 'image' | 'shape';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  selectedElementId: string | null;
  canvasBackground: string;
}

const UndoRedoIntegrationExample: React.FC = () => {
  // État initial de votre application
  const [appState, setAppState] = useState<AppState>({
    elements: [
      {
        id: '1',
        type: 'text',
        content: 'Texte exemple',
        x: 100,
        y: 100,
        width: 200,
        height: 50
      }
    ],
    selectedElementId: null,
    canvasBackground: '#ffffff'
  });

  // Configuration du système undo/redo
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
    lastAction,
    clearHistory
  } = useUndoRedo<AppState>({
    maxHistorySize: 50,
    onUndo: (restoredState) => {
      console.log('🔄 Undo: Restauration de l\'état', restoredState);
      setAppState(restoredState);
    },
    onRedo: (restoredState) => {
      console.log('🔄 Redo: Restauration de l\'état', restoredState);
      setAppState(restoredState);
    },
    onStateChange: (state, action) => {
      console.log(`📝 Changement d'état: ${action}`, state);
    }
  });

  // Activation des raccourcis clavier
  useUndoRedoShortcuts(undo, redo, {
    enabled: true,
    preventDefault: true
  });

  // Fonction utilitaire pour mettre à jour l'état avec historique
  const updateAppState = useCallback((
    newState: AppState | ((prev: AppState) => AppState),
    action: string = 'modify'
  ) => {
    const finalState = typeof newState === 'function' ? newState(appState) : newState;
    setAppState(finalState);
    addToHistory(finalState, action);
  }, [appState, addToHistory]);

  // Exemples d'actions qui utilisent l'historique
  const addElement = useCallback(() => {
    const newElement = {
      id: Date.now().toString(),
      type: 'text' as const,
      content: `Nouvel élément ${appState.elements.length + 1}`,
      x: Math.random() * 300,
      y: Math.random() * 300,
      width: 150,
      height: 40
    };

    updateAppState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }), 'add_element');
  }, [updateAppState, appState.elements.length]);

  const deleteSelectedElement = useCallback(() => {
    if (!appState.selectedElementId) return;

    updateAppState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== appState.selectedElementId),
      selectedElementId: null
    }), 'delete_element');
  }, [updateAppState, appState.selectedElementId]);

  const changeBackground = useCallback(() => {
    const colors = ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0'];
    const currentIndex = colors.indexOf(appState.canvasBackground);
    const nextColor = colors[(currentIndex + 1) % colors.length];

    updateAppState(prev => ({
      ...prev,
      canvasBackground: nextColor
    }), 'change_background');
  }, [updateAppState, appState.canvasBackground]);

  const moveElement = useCallback((elementId: string, deltaX: number, deltaY: number) => {
    updateAppState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
          : el
      )
    }), 'move_element');
  }, [updateAppState]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Exemple d'Intégration Undo/Redo</h1>
      
      {/* Barre d'outils avec boutons undo/redo */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="font-semibold">Barre d'outils</h2>
            
            {/* Boutons undo/redo intégrés dans la toolbar */}
            <ToolbarUndoRedoButtons
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              size="md"
              variant="default"
            />
            
            {/* Actions d'exemple */}
            <button
              onClick={addElement}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ajouter élément
            </button>
            
            <button
              onClick={deleteSelectedElement}
              disabled={!appState.selectedElementId}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Supprimer sélectionné
            </button>
            
            <button
              onClick={changeBackground}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Changer fond
            </button>
          </div>
          
          {/* Informations sur l'historique */}
          <div className="text-sm text-gray-600">
            Historique: {historySize} | Dernière action: {lastAction}
          </div>
        </div>
      </div>

      {/* Zone de canvas simulée */}
      <div 
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: appState.canvasBackground,
          minHeight: '400px'
        }}
      >
        <div className="absolute top-2 left-2 text-sm text-gray-500">
          Canvas (Cliquez sur les éléments pour les sélectionner)
        </div>
        
        {/* Rendu des éléments */}
        {appState.elements.map(element => (
          <div
            key={element.id}
            className={`absolute border-2 p-2 cursor-pointer transition-colors ${
              appState.selectedElementId === element.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height
            }}
            onClick={() => {
              updateAppState(prev => ({
                ...prev,
                selectedElementId: element.id
              }), 'select_element');
            }}
          >
            <div className="text-sm font-medium">{element.content}</div>
            <div className="text-xs text-gray-500">
              {element.type} - {element.id}
            </div>
            
            {/* Boutons de déplacement pour l'exemple */}
            {appState.selectedElementId === element.id && (
              <div className="absolute -top-8 left-0 flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(element.id, -10, 0);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white text-xs rounded"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(element.id, 10, 0);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white text-xs rounded"
                >
                  →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(element.id, 0, -10);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white text-xs rounded"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(element.id, 0, 10);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white text-xs rounded"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Panneau d'informations et contrôles avancés */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations sur l'état */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">État de l'application</h3>
          <div className="space-y-2 text-sm">
            <div>Éléments: {appState.elements.length}</div>
            <div>Sélectionné: {appState.selectedElementId || 'Aucun'}</div>
            <div>Fond: {appState.canvasBackground}</div>
          </div>
        </div>

        {/* Contrôles de l'historique */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Contrôles de l'historique</h3>
          
          {/* Boutons undo/redo alternatifs */}
          <div className="mb-4">
            <UndoRedoButtons
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              size="lg"
              variant="outline"
              orientation="horizontal"
            />
          </div>
          
          <div className="space-y-2 text-sm">
            <div>Peut annuler: {canUndo ? 'Oui' : 'Non'}</div>
            <div>Peut rétablir: {canRedo ? 'Oui' : 'Non'}</div>
            <div>Taille historique: {historySize}</div>
            <div>Dernière action: {lastAction}</div>
          </div>
          
          <button
            onClick={clearHistory}
            className="mt-3 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Vider l'historique
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Utilisez <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+Z</kbd> (ou <kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+Z</kbd>) pour annuler</li>
          <li>• Utilisez <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+Y</kbd> ou <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+Shift+Z</kbd> pour rétablir</li>
          <li>• Cliquez sur les éléments pour les sélectionner</li>
          <li>• Utilisez les flèches pour déplacer l'élément sélectionné</li>
          <li>• Toutes les actions sont enregistrées dans l'historique</li>
        </ul>
      </div>
    </div>
  );
};

export default UndoRedoIntegrationExample;
