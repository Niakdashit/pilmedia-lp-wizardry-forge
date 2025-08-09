import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/Layout/PageHeader';
import { CampaignType, getCampaignTypeIcon } from '../utils/campaignTypes';

const Gamification: React.FC = () => {
  const gamificationTypes = [
    {
      name: 'Roue de la fortune',
      description: 'Faites tourner la roue pour gagner des réductions, cadeaux ou surprises',
      color: '#841b60',
      image: '/gamification/wheel.svg',
      type: 'wheel' as CampaignType
    },
    {
      name: 'Carte à gratter',
      description: 'Découvrez ce qui se cache sous la surface grattable',
      color: '#2c7be5',
      image: '/gamification/scratch.svg',
      type: 'scratch' as CampaignType
    },
    {
      name: 'Jeu de mémoire',
      description: 'Trouvez les paires correspondantes pour gagner des points',
      color: '#00b8d9',
      image: '/gamification/memory.svg',
      type: 'memory' as CampaignType
    },
    {
      name: 'Quiz interactifs',
      description: 'Testez vos connaissances et gagnez des points en fonction de vos réponses',
      color: '#f5803e',
      image: '/gamification/quiz.svg',
      type: 'quiz' as CampaignType
    },
    {
      name: 'Formulaire dynamique',
      description: 'Créez des formulaires interactifs avec logique conditionnelle et validation en temps réel',
      color: '#36b37e',
      image: '/gamification/form.svg',
      type: 'form' as CampaignType
    },
    {
      name: 'Puzzle',
      description: 'Reconstituez l\'image en déplaçant les pièces au bon endroit',
      color: '#6554c0',
      image: '/gamification/puzzle.svg',
      type: 'puzzle' as CampaignType
    },
    {
      name: 'Dés chanceux',
      description: 'Lancez les dés et tentez votre chance pour gagner des lots',
      color: '#ff5630',
      image: '/gamification/dice.svg',
      type: 'dice' as CampaignType
    },
    {
      name: 'Jackpot',
      description: 'Faites tourner les rouleaux et tentez de décrocher le jackpot',
      color: '#ffd700',
      image: '/gamification/jackpot.svg',
      type: 'jackpot' as CampaignType
    }
  ];

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Gamification"
        actions={
          <div className="flex gap-x-4">
            <Link
              to="/design-editor"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-semibold rounded-xl hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Éditeur de Jeux
            </Link>
            <Link
              to="/design-editor"
              className="inline-flex items-center px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Éditeur de Jeux
            </Link>
          </div>
        }
      />

      <div className="px-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mécaniques de jeu</h2>
            <p className="text-gray-600">
              Utilisez ces éléments de gamification pour augmenter l'engagement dans vos campagnes.
              Chaque type de jeu est personnalisable et peut être intégré à vos campagnes marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gamificationTypes.map((game, index) => {
              const IconComponent = getCampaignTypeIcon(game.type);
              return (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-24 overflow-hidden">
                    <img src={game.image} alt={game.name} className="object-cover w-full h-full" />
                    <div className="absolute inset-0" style={{ backgroundColor: game.color, opacity: 0.3 }} />
                    <IconComponent className="absolute inset-0 m-auto w-10 h-10 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1">{game.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{game.description}</p>
                    <Link
                      to="/design-editor"
                      className="w-full px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-[#841b60] hover:text-white transition-colors duration-200 block text-center"
                    >
                      Créer avec l'éditeur
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Campagnes avec gamification</h2>

          <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom de la campagne
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de jeu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux d'engagement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Roue de la Fortune Soldes</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Roue de la fortune</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">1,256</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">78%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Terminé
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Mémoire Nouveaux Produits</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Jeu de mémoire</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">842</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">65%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Grattage Anniversaire</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Carte à gratter</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">568</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">72%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Programmé
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
