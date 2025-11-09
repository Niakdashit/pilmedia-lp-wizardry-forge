
import React, { useState } from 'react';
import { Sparkles, Save, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNewsletterStore } from '@/stores/newsletterStore';

interface Template {
  id: string;
  name: string;
  prompt: string;
  content: string;
  createdAt: string;
}

export const SettingsTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  const { setFromGeneratedHTML, loadGeneratedAsModules } = useNewsletterStore();

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) throw new Error('Failed to generate newsletter');

      const data = await response.json();
      setGeneratedContent(data.html);
    } catch (error) {
      console.error(error);
      setGeneratedContent(`
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <h1 style="color:#333;">Newsletter générée</h1>
          <p style="color:#666;">Contenu basé sur le prompt: ${prompt}</p>
          <div style="margin:20px 0;">
            <a href="#" style="background:#44444d;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
              Call to Action
            </a>
          </div>
        </div>
      `);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!prompt || !generatedContent) return;
    const newTemplate = {
      id: Date.now().toString(),
      name: `Template ${templates.length + 1}`,
      prompt,
      content: generatedContent,
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
    setPrompt('');
    setGeneratedContent('');
  };

  const handleExportToEditor = () => {
    if (!generatedContent) return;
    if (setFromGeneratedHTML) {
      setFromGeneratedHTML(generatedContent);
    }
    if (loadGeneratedAsModules) {
      loadGeneratedAsModules(generatedContent);
    }
    toast.success("Le template a bien été transféré dans l'onglet Modifier.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#44444d] mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2" /> Générateur de Template avec IA
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt de génération</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez la newsletter que vous souhaitez générer..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="professional">Professionnel</option>
              <option value="minimalist">Minimaliste</option>
              <option value="creative">Créatif</option>
              <option value="emotional">Émotionnel</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full px-4 py-2 bg-gradient-to-br from-[#44444d] to-[#44444d] text-white rounded-lg"
          >
            {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
          </button>

          {generatedContent && (
            <div className="space-y-4">
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <div className="flex justify-between flex-wrap gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-1" /> Aperçu
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-gradient-to-br from-[#44444d] to-[#44444d] text-white rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" /> Sauvegarder comme template
                </button>
                <button
                  onClick={handleExportToEditor}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  📤 Utiliser dans l'onglet Modifier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-lg p-6 relative overflow-auto max-h-[90vh]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-[#44444d]">Aperçu de la newsletter</h3>
            <div dangerouslySetInnerHTML={{ __html: generatedContent }} className="prose max-w-none" />
          </div>
        </div>
      )}
    </div>
  );
};
