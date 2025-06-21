import React from 'react';
import { BarChart2, AlertCircle, Plus } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/common/Button';

const Social: React.FC = () => {
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Réseaux sociaux"
        size="sm"
        actions={
          <Button variant="primary" className="px-4 py-2">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Publication
          </Button>
        }
      />

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Publications</h2>
              <div className="space-y-4">
                {[1, 2, 3].map(post => (
                  <div key={post} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400">Image</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-600 mb-2">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>❤️ 245</span>
                          <span>💬 23</span>
                          <span>🔄 12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Comparatif multi-réseaux</h2>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <select className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]">
                    <option>Likes</option>
                    <option>Commentaires</option>
                    <option>Partages</option>
                  </select>
                  <Button variant="primary" className="px-4 py-2 font-medium rounded-lg">
                    Comparer
                  </Button>
                </div>
                <div className="h-64 border border-gray-200 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-8 h-8 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Alertes</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 text-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Baisse d'engagement</p>
                    <p className="text-sm">-15% cette semaine</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Commentaire négatif</p>
                    <p className="text-sm">2 nouveaux signalements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Performances</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Engagement moyen</span>
                  <span className="font-medium">4.8%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Meilleur post</span>
                  <span className="font-medium">852 likes</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Portée totale</span>
                  <span className="font-medium">12.4k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
