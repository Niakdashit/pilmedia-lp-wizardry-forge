import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, Users, Target, ArrowUpRight, Calendar, Download } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PillButton from '../components/shared/PillButton';

const Statistics: React.FC = () => {
  const [period, setPeriod] = useState('30');
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Statistiques"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Cette année</option>
            </select>
            <PillButton icon={<Download className="w-4 h-4" />}>Exporter</PillButton>
          </div>
        }
      />

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">Participants Total</p>
                <h3 className="text-2xl font-bold mt-1">12,845</h3>
                <p className="text-green-500 text-sm mt-1">+12.5% vs période précédente</p>
              </div>
              <div className="bg-[#f8f0f5] p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#d4dbe8]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">Taux de Conversion</p>
                <h3 className="text-2xl font-bold mt-1">34.2%</h3>
                <p className="text-green-500 text-sm mt-1">+2.4% vs période précédente</p>
              </div>
              <div className="bg-[#f8f0f5] p-3 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-[#d4dbe8]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">Campagnes Actives</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
                <p className="text-green-500 text-sm mt-1">+3 vs période précédente</p>
              </div>
              <div className="bg-[#f8f0f5] p-3 rounded-lg">
                <Target className="w-6 h-6 text-[#d4dbe8]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">Durée Moyenne</p>
                <h3 className="text-2xl font-bold mt-1">3m 24s</h3>
                <p className="text-red-500 text-sm mt-1">-15s vs période précédente</p>
              </div>
              <div className="bg-[#f8f0f5] p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-[#d4dbe8]" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Évolution des participations</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 text-sm rounded-xl bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] text-white border border-white/20 shadow shadow-[#d4dbe8]/20">Participants</button>
                <button className="px-3 py-1.5 text-sm rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">Taux de conversion</button>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
              <LineChart className="w-10 h-10 text-gray-300" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Répartition par type</h2>
            <div className="h-64 flex items-center justify-center">
              <PieChart className="w-10 h-10 text-gray-300" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] mr-2"></div>
                  <span className="text-sm text-gray-600">Quiz</span>
                </div>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#2c7be5] mr-2"></div>
                  <span className="text-sm text-gray-600">Concours</span>
                </div>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#00b8d9] mr-2"></div>
                  <span className="text-sm text-gray-600">Sondage</span>
                </div>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f5803e] mr-2"></div>
                  <span className="text-sm text-gray-600">Jeux</span>
                </div>
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Top Campagnes</h2>
            
            <div className="space-y-4">
              {[{
              name: 'Quiz Marketing Digital',
              type: 'quiz',
              participants: 1245,
              conversion: '68%'
            }, {
              name: 'Roue de la Fortune Soldes',
              type: 'wheel',
              participants: 1056,
              conversion: '54%'
            }, {
              name: 'Concours Photo Été',
              type: 'contest',
              participants: 867,
              conversion: '42%'
            }, {
              name: 'Sondage Satisfaction',
              type: 'survey',
              participants: 643,
              conversion: '38%'
            }].map((campaign, index) => (
                <div key={index} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="w-10 h-10 rounded-lg bg-[#f8f0f5] flex items-center justify-center mr-4">
                    <Target className="w-5 h-5 text-[#d4dbe8]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-800">{campaign.name}</p>
                      <p className="text-sm font-medium text-gray-600">{campaign.participants}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">{campaign.type}</p>
                      <p className="text-xs text-green-500">{campaign.conversion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Sources de Trafic</h2>
            
            <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
              <BarChart3 className="w-10 h-10 text-gray-300" />
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] mr-2"></div>
                  <span className="text-sm text-gray-600">Réseaux sociaux</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#2c7be5] mr-2"></div>
                  <span className="text-sm text-gray-600">Liens directs</span>
                </div>
                <span className="text-sm font-medium">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#00b8d9] mr-2"></div>
                  <span className="text-sm text-gray-600">Email</span>
                </div>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f5803e] mr-2"></div>
                  <span className="text-sm text-gray-600">Autres</span>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
