'use client';

import { useEditorStore } from '../stores/editorStore';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Hook pour gérer les états isolés par éditeur
 * Évite les conflits entre /jackpot-editor et /form-editor
 */
export const useEditorState = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Déterminer le type d'éditeur basé sur la route
  const getEditorType = () => {
    if (pathname === '/form-editor') return 'form-editor';
    if (pathname === '/jackpot-editor') return 'jackpot-editor';
    if (pathname === '/quiz-editor') return 'quiz-editor';
    if (pathname === '/scratch-card-editor') return 'scratch-card-editor';
    return 'default';
  };
  
  const editorType = getEditorType();
  
  // Actions du store
  const setEditorActiveTab = useEditorStore((state) => state.setEditorActiveTab);
  const setEditorPanelState = useEditorStore((state) => state.setEditorPanelState);
  const getEditorState = useEditorStore((state) => state.getEditorState);
  const resetEditorState = useEditorStore((state) => state.resetEditorState);
  
  // État actuel de l'éditeur
  const editorState = getEditorState(editorType);
  
  // Reset de l'état de l'éditeur au changement de route
  useEffect(() => {
    // Reset l'état de l'éditeur précédent si nécessaire
    const prevEditorType = sessionStorage.getItem('prevEditorType');
    if (prevEditorType && prevEditorType !== editorType) {
      // Optionnel : reset l'état de l'éditeur précédent
      // resetEditorState(prevEditorType);
    }
    
    // Sauvegarder le type d'éditeur actuel
    sessionStorage.setItem('prevEditorType', editorType);
    
    // Initialiser l'état de l'éditeur actuel s'il n'existe pas
    if (!editorState) {
      resetEditorState(editorType);
    }
  }, [editorType, resetEditorState, editorState]);
  
  // Fonctions wrapper pour cet éditeur spécifique
  const setActiveTab = (tab: string) => {
    setEditorActiveTab(editorType, tab);
  };
  
  const setPanelState = (panel: string, show: boolean) => {
    setEditorPanelState(editorType, panel, show);
  };
  
  return {
    editorType,
    activeTab: editorState.activeTab,
    showQuizPanel: editorState.showQuizPanel,
    showJackpotPanel: editorState.showJackpotPanel,
    showDesignPanel: editorState.showDesignPanel,
    showEffectsPanel: editorState.showEffectsPanel,
    showAnimationsPanel: editorState.showAnimationsPanel,
    showPositionPanel: editorState.showPositionPanel,
    setActiveTab,
    setPanelState,
    resetEditorState: () => resetEditorState(editorType)
  };
};
