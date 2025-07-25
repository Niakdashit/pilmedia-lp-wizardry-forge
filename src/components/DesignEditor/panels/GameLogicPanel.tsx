import React from 'react';
import { Gamepad2, Trophy, Percent, Settings } from 'lucide-react';

const GameLogicPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Probabilités de gain */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Percent className="w-4 h-4 inline mr-2" />
          Probabilités de gain
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Taux de gain global</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="20"
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">20%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gros lot</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                defaultValue="1"
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mécaniques de jeu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Gamepad2 className="w-4 h-4 inline mr-2" />
          Mécaniques spéciales
        </label>
        <div className="space-y-2">
          {[
            { id: 'double-chance', label: 'Double chance', desc: 'Permet une seconde tentative' },
            { id: 'bonus-time', label: 'Temps bonus', desc: 'Temps supplémentaire' },
            { id: 'multiplier', label: 'Multiplicateur', desc: 'Multiplie les gains' },
            { id: 'combo', label: 'Système de combo', desc: 'Gains consécutifs' }
          ].map((mechanic) => (
            <div key={mechanic.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
              <input
                type="checkbox"
                id={mechanic.id}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor={mechanic.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {mechanic.label}
                </label>
                <p className="text-xs text-gray-500">{mechanic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Système de points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Trophy className="w-4 h-4 inline mr-2" />
          Système de points
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enable-points"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enable-points" className="text-sm text-gray-700">
              Activer le système de points
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Points par participation</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Points bonus victoire</label>
              <input
                type="number"
                defaultValue="50"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conditions de participation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Settings className="w-4 h-4 inline mr-2" />
          Conditions de participation
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tentatives par utilisateur</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="1">1 tentative</option>
              <option value="3">3 tentatives</option>
              <option value="5">5 tentatives</option>
              <option value="unlimited">Illimité</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Délai entre tentatives</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="none">Aucun délai</option>
              <option value="1h">1 heure</option>
              <option value="24h">24 heures</option>
              <option value="weekly">1 semaine</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLogicPanel;