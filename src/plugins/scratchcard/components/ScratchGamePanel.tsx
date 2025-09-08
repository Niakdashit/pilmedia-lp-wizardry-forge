import React, { useState, useCallback } from 'react';
import './ScratchGamePanel.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Palette, TestTube, RotateCcw } from 'lucide-react';
import { ScratchCardState, ScratchCard, ScratchCardCover } from '../types';
import { scratchCardStateHelpers, createDefaultState } from '../store';

interface ScratchGamePanelProps {
  state: ScratchCardState;
  onStateChange: (state: ScratchCardState) => void;
  mode: 'edit' | 'preview';
  onModeChange: (mode: 'edit' | 'preview') => void;
}

export const ScratchGamePanel: React.FC<ScratchGamePanelProps> = ({
  state,
  onStateChange,
  mode,
  onModeChange
}) => {
  const [activeTab, setActiveTab] = useState('design');

  // Handle settings updates
  const updateSettings = useCallback((updates: Partial<typeof state.settings>) => {
    const newState = scratchCardStateHelpers.updateSettings(state, updates);
    onStateChange(newState);
  }, [state, onStateChange]);

  // Handle card updates
  const updateCard = useCallback((cardId: string, updates: Partial<ScratchCard>) => {
    const newState = scratchCardStateHelpers.updateCard(state, cardId, updates);
    onStateChange(newState);
  }, [state, onStateChange]);

  // Add new card
  const addCard = useCallback(() => {
    const newState = scratchCardStateHelpers.addCard(state);
    onStateChange(newState);
  }, [state, onStateChange]);

  // Remove card
  const removeCard = useCallback((cardId: string) => {
    if (state.cards.length <= 1) return; // Keep at least one card
    const newState = scratchCardStateHelpers.removeCard(state, cardId);
    onStateChange(newState);
  }, [state, onStateChange]);

  // Handle file upload for covers
  const handleCoverUpload = useCallback((file: File, isGlobal: boolean = false, cardId?: string) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const cover: ScratchCardCover = { type: 'image', url, alt: file.name };
      
      if (isGlobal) {
        updateSettings({ globalCover: cover });
      } else if (cardId) {
        updateCard(cardId, { cover });
      }
    };
    reader.readAsDataURL(file);
  }, [updateSettings, updateCard]);

  // Handle test mode
  const handleTest = useCallback(() => {
    onModeChange(mode === 'edit' ? 'preview' : 'edit');
  }, [mode, onModeChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    const newState = scratchCardStateHelpers.resetCards(state);
    onStateChange(newState);
  }, [state, onStateChange]);

  // Handle export/import
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scratch-cards-config.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        onStateChange(imported);
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    };
    reader.readAsText(file);
  }, [onStateChange]);

  return (
    <div className="sc-panel">
      <div className="sc-panel__header">
        <div className="sc-panel__title">
          <h3>Jeu de Cartes à Gratter</h3>
          <span className={`sc-panel__mode-badge ${mode === 'edit' ? 'sc-panel__mode-badge--edit' : 'sc-panel__mode-badge--preview'}`}>
            {mode === 'edit' ? 'Édition' : 'Aperçu'}
          </span>
        </div>
        
        <div className="sc-panel__actions">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            {mode === 'edit' ? 'Tester' : 'Éditer'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="sc-panel__separator" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="sc-panel__tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="cover">Couverture</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
          <TabsTrigger value="reveal">Révélation</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disposition</CardTitle>
              <CardDescription>Configuration de la grille et du comportement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lignes</Label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={state.settings.grid.rows}
                    onChange={(e) => updateSettings({
                      grid: { ...state.settings.grid, rows: parseInt(e.target.value) || 1 }
                    })}
                  />
                </div>
                <div>
                  <Label>Colonnes</Label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={state.settings.grid.cols}
                    onChange={(e) => updateSettings({
                      grid: { ...state.settings.grid, cols: parseInt(e.target.value) || 1 }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Espacement: {state.settings.grid.gap}px</Label>
                <Slider
                  value={[state.settings.grid.gap]}
                  onValueChange={([value]) => updateSettings({
                    grid: { ...state.settings.grid, gap: value }
                  })}
                  min={0}
                  max={32}
                  step={2}
                />
              </div>

              <div>
                <Label>Arrondi des cartes: {state.settings.grid.borderRadius}px</Label>
                <Slider
                  value={[state.settings.grid.borderRadius]}
                  onValueChange={([value]) => updateSettings({
                    grid: { ...state.settings.grid, borderRadius: value }
                  })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grattage</CardTitle>
              <CardDescription>Paramètres du comportement de grattage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rayon de brosse: {state.settings.brush.radius}px</Label>
                <Slider
                  value={[state.settings.brush.radius]}
                  onValueChange={([value]) => updateSettings({
                    brush: { ...state.settings.brush, radius: value }
                  })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>

              <div>
                <Label>Seuil de révélation: {Math.round(state.settings.threshold * 100)}%</Label>
                <Slider
                  value={[state.settings.threshold * 100]}
                  onValueChange={([value]) => updateSettings({
                    threshold: value / 100
                  })}
                  min={30}
                  max={90}
                  step={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={state.settings.effects?.confetti || false}
                  onChange={(e) => updateSettings({
                    effects: { ...state.settings.effects, confetti: e.target.checked }
                  })}
                  className="sc-checkbox"
                />
                <Label>Effet confetti pour les gagnants</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Couverture Globale</CardTitle>
              <CardDescription>Couverture par défaut appliquée à toutes les cartes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Image de couverture</Label>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleCoverUpload(file, true);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Télécharger
                  </Button>
                  {state.settings.globalCover?.type === 'image' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Image configurée
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Couleur unie</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={state.settings.globalCover?.type === 'color' ? state.settings.globalCover.value : '#C0C0C0'}
                      onChange={(e) => updateSettings({
                        globalCover: { type: 'color', value: e.target.value }
                      })}
                      className="w-16 h-8 p-1 border rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({
                        globalCover: { type: 'color', value: '#C0C0C0' }
                      })}
                    >
                      <Palette className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {state.settings.globalCover && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ globalCover: undefined })}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer la couverture globale
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cartes ({state.cards.length})</h4>
              <p className="text-sm text-muted-foreground">
                Gérer les cartes individuelles
              </p>
            </div>
            <Button onClick={addCard} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-3">
            {state.cards.map((card, index) => (
              <Card key={card.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={card.title || ''}
                            onChange={(e) => updateCard(card.id, { title: e.target.value })}
                            placeholder={`Carte ${index + 1}`}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={card.isWinner || false}
                            onChange={(e) => updateCard(card.id, { isWinner: e.target.checked })}
                            className="sc-checkbox"
                          />
                          <Label>Gagnante</Label>
                          {card.isWinner && <span className="text-xs">🏆</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Couverture spécifique</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleCoverUpload(file, false, card.id);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-3 h-3" />
                            {card.cover ? 'Modifier' : 'Ajouter'}
                          </Button>
                        </div>
                        
                        <div>
                          <Label>Contenu révélé</Label>
                          <Input
                            value={card.reveal?.type === 'text' ? card.reveal.value : ''}
                            onChange={(e) => updateCard(card.id, {
                              reveal: { type: 'text', value: e.target.value }
                            })}
                            placeholder="Texte à révéler..."
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCard(card.id)}
                      disabled={state.cards.length <= 1}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reveal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Révélation Globale</CardTitle>
              <CardDescription>Contenu par défaut révélé pour toutes les cartes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Texte global</Label>
                <Input
                  value={state.settings.globalReveal?.type === 'text' ? state.settings.globalReveal.value : ''}
                  onChange={(e) => updateSettings({
                    globalReveal: { type: 'text', value: e.target.value }
                  })}
                  placeholder="Texte révélé par défaut..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Taille de police</Label>
                  <Slider
                    value={[
                      state.settings.globalReveal?.type === 'text' 
                        ? (state.settings.globalReveal.style?.fontSize || 16)
                        : 16
                    ]}
                    onValueChange={([value]) => updateSettings({
                      globalReveal: {
                        type: 'text',
                        value: state.settings.globalReveal?.type === 'text' ? state.settings.globalReveal.value : '',
                        style: {
                          ...(state.settings.globalReveal?.type === 'text' ? state.settings.globalReveal.style : {}),
                          fontSize: value
                        }
                      }
                    })}
                    min={10}
                    max={32}
                    step={1}
                  />
                  <span className="text-xs text-muted-foreground">
                    {state.settings.globalReveal?.type === 'text' ? (state.settings.globalReveal.style?.fontSize || 16) : 16}px
                  </span>
                </div>
                
                <div>
                  <Label>Graisse</Label>
                  <Slider
                    value={[
                      state.settings.globalReveal?.type === 'text'
                        ? (state.settings.globalReveal.style?.fontWeight || 400)
                        : 400
                    ]}
                    onValueChange={([value]) => updateSettings({
                      globalReveal: {
                        type: 'text',
                        value: state.settings.globalReveal?.type === 'text' ? state.settings.globalReveal.value : '',
                        style: {
                          ...(state.settings.globalReveal?.type === 'text' ? state.settings.globalReveal.style : {}),
                          fontWeight: value
                        }
                      }
                    })}
                    min={100}
                    max={900}
                    step={100}
                  />
                  <span className="text-xs text-muted-foreground">
                    {state.settings.globalReveal?.type === 'text' ? (state.settings.globalReveal.style?.fontWeight || 400) : 400}
                  </span>
                </div>
              </div>

              {state.settings.globalReveal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ globalReveal: undefined })}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer la révélation globale
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2"
                >
                  Exporter JSON
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'application/json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImport(file);
                    };
                    input.click();
                  }}
                  className="gap-2"
                >
                  Importer JSON
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => onStateChange(createDefaultState())}
                  className="gap-2"
                >
                  Configuration par défaut
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};