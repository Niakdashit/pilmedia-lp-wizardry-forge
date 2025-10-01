import React from 'react';
import type { BlocHtml } from '@/types/modularEditor';

interface HtmlModulePanelProps {
  module: BlocHtml;
  onUpdate: (patch: Partial<BlocHtml>) => void;
  onBack?: () => void;
}

const HtmlModulePanel: React.FC<HtmlModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const [localHtml, setLocalHtml] = React.useState(module.html || '');

  React.useEffect(() => {
    setLocalHtml(module.html || '');
  }, [module.id, module.html]);

  const handleSave = React.useCallback(() => {
    onUpdate({ html: localHtml });
  }, [localHtml, onUpdate]);

  return (
    <div className="h-full overflow-y-auto pb-16">
      {onBack && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[#d4dbe8] hover:underline"
            onClick={onBack}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux éléments
          </button>
        </div>
      )}

      <div className="px-4 py-5 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Bloc HTML personnalisé</h3>
          <p className="mt-1 text-xs text-gray-500">
            Collez ici le code HTML qui sera inséré directement dans le module. Utilisez avec précaution : le rendu dépendra du client e-mail.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Code HTML</label>
          <textarea
            value={localHtml}
            onChange={(event) => setLocalHtml(event.target.value)}
            onBlur={handleSave}
            className="h-72 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 font-mono text-sm text-slate-800 shadow-inner focus:border-[#d4dbe8] focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]/30"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Le contenu est enregistré automatiquement.</span>
            <button
              type="button"
              className="text-[#d4dbe8] hover:underline"
              onClick={handleSave}
            >
              Sauvegarder maintenant
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Langage</label>
          <select
            value={module.language || 'html'}
            onChange={(event) => onUpdate({ language: event.target.value })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#d4dbe8] focus:ring-[#d4dbe8]"
          >
            <option value="html">HTML</option>
            <option value="liquid">Liquid</option>
            <option value="mjml">MJML</option>
          </select>
          <p className="text-[11px] text-gray-500">Le langage n’est pas encore utilisé dans le rendu mais permet de documenter le bloc.</p>
        </div>
      </div>
    </div>
  );
};

export default HtmlModulePanel;
