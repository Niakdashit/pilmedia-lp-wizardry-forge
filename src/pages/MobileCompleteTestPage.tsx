import React, { useState } from 'react';
import MobileTabsFinalTest from '../components/MobileTabsFinalTest';
import HybridSidebarMobileTest from '../components/HybridSidebarMobileTest';

const MobileCompleteTestPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'mobile-drawer' | 'hybrid-sidebar'>('mobile-drawer');

  return (
    <div className="h-screen w-screen">
      {/* Navigation entre les tests */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b p-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-bold">Tests complets des éditeurs mobiles</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTest('mobile-drawer')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTest === 'mobile-drawer'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Test Mobile Drawer
            </button>
            <button
              onClick={() => setActiveTest('hybrid-sidebar')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTest === 'hybrid-sidebar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Test Hybrid Sidebar
            </button>
          </div>
        </div>
      </div>

      {/* Contenu du test */}
      <div className="pt-16 h-full">
        {activeTest === 'mobile-drawer' && <MobileTabsFinalTest />}
        {activeTest === 'hybrid-sidebar' && <HybridSidebarMobileTest />}
      </div>
    </div>
  );
};

export default MobileCompleteTestPage;