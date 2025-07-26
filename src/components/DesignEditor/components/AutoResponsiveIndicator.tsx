import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';

interface AutoResponsiveIndicatorProps {
  adaptationSuggestions: Array<{
    elementId: string;
    device: 'desktop' | 'tablet' | 'mobile';
    issue: string;
    suggestion: string;
  }>;
}

const AutoResponsiveIndicator: React.FC<AutoResponsiveIndicatorProps> = ({
  adaptationSuggestions
}) => {
  const issueCount = adaptationSuggestions.length;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Auto-Responsive</span>
        {issueCount === 0 ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
            {issueCount} suggestions
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoResponsiveIndicator;