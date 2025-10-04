import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BlocPiedDePage } from '@/types/modularEditor';

export interface FooterModulePanelProps {
  module: BlocPiedDePage;
  onUpdate: (updates: Partial<BlocPiedDePage>) => void;
  onBack: () => void;
}

const FooterModulePanel: React.FC<FooterModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const currentAlign = module.align || 'center';
  const bandHeight = module.bandHeight ?? 60;
  const bandColor = module.bandColor ?? '#ffffff';
  const bandPadding = module.bandPadding ?? 16;
  const logoWidth = module.logoWidth ?? 120;
  const logoHeight = module.logoHeight ?? 120;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-sm font-semibold">Pied de page</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs">Logo</Label>
          <div className="mt-2 space-y-2">
            {module.logoUrl && (
              <div className="relative w-full h-32 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={module.logoUrl}
                  alt="Footer logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {module.logoUrl ? 'Changer' : 'Ajouter'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        <div>
          <Label className="text-xs">Largeur logo (px)</Label>
          <Input
            type="number"
            value={logoWidth}
            onChange={(e) => onUpdate({ logoWidth: parseInt(e.target.value) || 120 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Hauteur logo (px)</Label>
          <Input
            type="number"
            value={logoHeight}
            onChange={(e) => onUpdate({ logoHeight: parseInt(e.target.value) || 120 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Hauteur de la bande (px)</Label>
          <Input
            type="number"
            value={bandHeight}
            onChange={(e) => onUpdate({ bandHeight: parseInt(e.target.value) || 60 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Couleur de fond</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={bandColor}
              onChange={(e) => onUpdate({ bandColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={bandColor}
              onChange={(e) => onUpdate({ bandColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Padding vertical (px)</Label>
          <Input
            type="number"
            value={bandPadding}
            onChange={(e) => onUpdate({ bandPadding: parseInt(e.target.value) || 16 })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs mb-2 block">Alignement</Label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((a) => (
              <Button
                key={a}
                size="sm"
                variant={currentAlign === a ? 'default' : 'outline'}
                onClick={() => onUpdate({ align: a })}
                className="capitalize flex-1"
              >
                {a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterModulePanel;
