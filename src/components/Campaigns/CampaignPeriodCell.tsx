import React from 'react';

interface CampaignPeriodCellProps {
  startDate: string | null;
  endDate: string | null;
  status: string;
}

const CampaignPeriodCell: React.FC<CampaignPeriodCellProps> = ({ startDate, endDate, status }) => {
  if (!startDate || !endDate) {
    return <span className="text-gray-400">Non défini</span>;
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate days difference
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / msPerDay);
  const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / msPerDay);
  const daysSinceEnd = Math.ceil((now.getTime() - end.getTime()) / msPerDay);
  
  // Format dates for tooltip
  const formattedStart = start.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  const formattedEnd = end.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  let displayText = '';
  let colorClass = 'text-gray-700';
  
  if (status === 'active') {
    // Campaign is active - show days remaining
    if (daysUntilEnd > 0) {
      displayText = `${daysUntilEnd} jour${daysUntilEnd > 1 ? 's' : ''} restant${daysUntilEnd > 1 ? 's' : ''}`;
      colorClass = 'text-green-600 font-medium';
    } else if (daysUntilEnd === 0) {
      displayText = "Dernier jour";
      colorClass = 'text-orange-600 font-medium';
    }
  } else if (status === 'draft' || status === 'scheduled') {
    // Campaign hasn't started yet
    if (daysUntilStart > 0) {
      displayText = `J-${daysUntilStart}`;
      colorClass = 'text-blue-600 font-medium';
    } else if (daysUntilStart === 0) {
      displayText = "Démarre aujourd'hui";
      colorClass = 'text-blue-600 font-medium';
    } else {
      displayText = `J${Math.abs(daysUntilStart)}`;
      colorClass = 'text-gray-600';
    }
  } else if (status === 'ended') {
    // Campaign has ended
    if (daysSinceEnd === 0) {
      displayText = "Terminée aujourd'hui";
      colorClass = 'text-gray-500';
    } else if (daysSinceEnd === 1) {
      displayText = "Terminée hier";
      colorClass = 'text-gray-500';
    } else {
      displayText = `Terminée (J+${daysSinceEnd})`;
      colorClass = 'text-gray-500';
    }
  } else if (status === 'paused') {
    // Campaign is paused - show what would be the status
    if (now < start) {
      displayText = `En pause (J-${daysUntilStart})`;
      colorClass = 'text-yellow-600';
    } else if (now >= start && now <= end) {
      displayText = `En pause (${daysUntilEnd}j restants)`;
      colorClass = 'text-yellow-600';
    } else {
      displayText = `En pause (terminée)`;
      colorClass = 'text-yellow-600';
    }
  }
  
  return (
    <div className="relative group">
      <span className={colorClass}>{displayText}</span>
      
      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <div>
              <span className="text-gray-400">Début:</span> {formattedStart}
            </div>
            <div>
              <span className="text-gray-400">Fin:</span> {formattedEnd}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-6 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPeriodCell;
