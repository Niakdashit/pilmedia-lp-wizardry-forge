
import React from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const WheelConfiguration: React.FC = () => {
  const { segmentCount, setSegmentCount } = useQuickCampaignStore();

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de la roue</h3>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nombre de segments: <span className="text-blue-600 font-semibold">{segmentCount}</span>
          </label>
          <input
            type="range"
            min="4"
            max="12"
            value={segmentCount}
            onChange={(e) => setSegmentCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>4 segments</span>
            <span>12 segments</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WheelConfiguration;
