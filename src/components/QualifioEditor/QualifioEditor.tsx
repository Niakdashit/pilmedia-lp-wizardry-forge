import React, { useState } from 'react';
import QualifioSidebar from './QualifioSidebar';
import QualifioPreview from './QualifioPreview';
import QualifioFooter from './QualifioFooter';

interface QualifioEditorProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioEditor: React.FC<QualifioEditorProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="h-screen flex flex-col bg-slate-700">
      {/* Header avec titre de l'iframe */}
      <div className="bg-slate-800 border-b border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-sm font-medium text-orange-400">
              Iframe : {campaign.title}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM2 14a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM4 5h12v8H4V5z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4h8v10H6V4z" />
              </svg>
            </button>
            <button className="p-2 rounded text-gray-400 hover:text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Sidebar de navigation */}
        <QualifioSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          campaign={campaign}
          setCampaign={setCampaign}
        />

        {/* Zone de prévisualisation */}
        <QualifioPreview
          campaign={campaign}
          previewDevice={previewDevice}
        />
      </div>

      {/* Footer avec boutons d'action */}
      <QualifioFooter
        campaign={campaign}
      />
    </div>
  );
};

export default QualifioEditor;