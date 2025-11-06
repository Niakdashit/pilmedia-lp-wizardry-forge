import React, { useState } from 'react';

/**
 * Page de test pour toutes les intégrations Prosplay
 * Accessible via /integrations-test
 */
const IntegrationsTest = () => {
  const [testCampaignId] = useState('test-campaign-123');
  const [testUrl] = useState(`${window.location.origin}/campaign/${testCampaignId}`);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const tests = [
    {
      id: 'javascript',
      name: 'JavaScript Integration',
      description: 'Teste le chargement dynamique via JavaScript',
      test: () => {
        const containerId = `prosplay_insert_place_${testCampaignId}`;
        const container = document.getElementById(containerId);
        if (!container) {
          return { success: false, message: 'Conteneur non trouvé' };
        }
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = testUrl;
        iframe.width = '100%';
        iframe.height = '500';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', '0');
        iframe.style.cssText = 'overflow-x:hidden;max-width:800px;border:1px solid #e5e7eb;';
        
        container.appendChild(iframe);
        
        return { success: true, message: 'Iframe créée avec succès' };
      }
    },
    {
      id: 'html',
      name: 'HTML Integration',
      description: 'Teste l\'iframe HTML statique',
      test: () => {
        const container = document.getElementById('html-test-container');
        if (!container) {
          return { success: false, message: 'Conteneur non trouvé' };
        }
        
        container.innerHTML = `<iframe src="${testUrl}" width="100%" height="500" scrolling="no" frameborder="0" style="overflow-x:hidden;max-width:800px;border:1px solid #e5e7eb;"></iframe>`;
        
        return { success: true, message: 'Iframe HTML créée avec succès' };
      }
    },
    {
      id: 'oembed-json',
      name: 'oEmbed JSON',
      description: 'Teste l\'endpoint oEmbed JSON',
      test: async () => {
        try {
          const oembedUrl = `${window.location.origin}/oembed?format=json&url=${encodeURIComponent(testUrl)}&id=${encodeURIComponent(testCampaignId)}`;
          const response = await fetch(oembedUrl);
          
          if (!response.ok) {
            return { success: false, message: `Erreur HTTP: ${response.status}` };
          }
          
          const data = await response.json();
          
          if (data.error) {
            return { success: false, message: data.error };
          }
          
          if (data.version === '1.0' && data.type === 'rich' && data.html) {
            const container = document.getElementById('oembed-json-container');
            if (container) {
              container.innerHTML = `<pre style="background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow-x:auto;font-size:0.75rem;">${JSON.stringify(data, null, 2)}</pre>`;
            }
            return { success: true, message: 'oEmbed JSON valide' };
          }
          
          return { success: false, message: 'Format oEmbed invalide' };
        } catch (error) {
          return { success: false, message: `Erreur: ${error}` };
        }
      }
    },
    {
      id: 'oembed-xml',
      name: 'oEmbed XML',
      description: 'Teste l\'endpoint oEmbed XML',
      test: async () => {
        try {
          const oembedUrl = `${window.location.origin}/oembed?format=xml&url=${encodeURIComponent(testUrl)}&id=${encodeURIComponent(testCampaignId)}`;
          const response = await fetch(oembedUrl);
          
          if (!response.ok) {
            return { success: false, message: `Erreur HTTP: ${response.status}` };
          }
          
          const text = await response.text();
          
          if (text.includes('<oembed>') && text.includes('</oembed>')) {
            const container = document.getElementById('oembed-xml-container');
            if (container) {
              container.innerHTML = `<pre style="background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow-x:auto;font-size:0.75rem;">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            }
            return { success: true, message: 'oEmbed XML valide' };
          }
          
          return { success: false, message: 'Format XML invalide' };
        } catch (error) {
          return { success: false, message: `Erreur: ${error}` };
        }
      }
    },
    {
      id: 'smart-url',
      name: 'Smart URL',
      description: 'Teste la détection de device',
      test: () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
        
        const container = document.getElementById('smart-url-container');
        if (!container) {
          return { success: false, message: 'Conteneur non trouvé' };
        }
        
        let deviceType = 'Desktop';
        if (isMobile && !isTablet) {
          deviceType = 'Mobile';
        } else if (isTablet) {
          deviceType = 'Tablet';
        }
        
        container.innerHTML = `
          <div style="background:#f3f4f6;padding:1rem;border-radius:0.5rem;">
            <p><strong>Device détecté:</strong> ${deviceType}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
            <p><strong>Largeur écran:</strong> ${window.innerWidth}px</p>
            <p><strong>Comportement:</strong> ${isMobile && !isTablet ? 'Redirection plein écran' : 'Iframe responsive'}</p>
          </div>
        `;
        
        return { success: true, message: `Device détecté: ${deviceType}` };
      }
    }
  ];

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const result = await test.test();
    
    const statusEl = document.getElementById(`status-${testId}`);
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="mt-2 p-2 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${result.success ? '✅' : '❌'} ${result.message}
        </div>
      `;
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des Intégrations Prosplay
          </h1>
          <p className="text-gray-600 mb-4">
            Cette page teste toutes les méthodes d'intégration disponibles.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>URL de test:</strong> {testUrl}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Campaign ID:</strong> {testCampaignId}
            </p>
          </div>
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lancer tous les tests
          </button>
        </div>

        <div className="space-y-6">
          {tests.map(test => (
            <div key={test.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {test.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{test.description}</p>
                </div>
                <button
                  onClick={() => runTest(test.id)}
                  disabled={activeTest === test.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tester
                </button>
              </div>
              
              <div id={`status-${test.id}`}></div>
              
              <div className="mt-4">
                {test.id === 'javascript' && (
                  <div id={`prosplay_insert_place_${testCampaignId}`} className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]">
                    <p className="text-gray-400 text-center">Zone d'insertion JavaScript</p>
                  </div>
                )}
                {test.id === 'html' && (
                  <div id="html-test-container" className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]">
                    <p className="text-gray-400 text-center">Zone d'insertion HTML</p>
                  </div>
                )}
                {test.id === 'oembed-json' && (
                  <div id="oembed-json-container" className="mt-2"></div>
                )}
                {test.id === 'oembed-xml' && (
                  <div id="oembed-xml-container" className="mt-2"></div>
                )}
                {test.id === 'smart-url' && (
                  <div id="smart-url-container" className="mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Documentation
          </h2>
          <p className="text-gray-600 mb-4">
            Pour plus d'informations sur les intégrations, consultez le guide complet :
          </p>
          <a
            href="/src/docs/IntegrationsGuide.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Guide des Intégrations Prosplay
          </a>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTest;
