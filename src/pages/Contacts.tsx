import React from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';

const Contacts: React.FC = () => {
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Contacts"
        size="sm"
        actions={
          <button className="inline-flex items-center px-8 py-4 bg-[#841b60] text-white font-semibold rounded-2xl hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Contact
          </button>
        }
      />

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Liste des contacts</h2>
            <p className="text-gray-600">
              Ici, vous pouvez gérer tous vos contacts. Ajoutez, modifiez ou supprimez des contacts selon vos besoins.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Importer des contacts</h2>
            <p className="text-gray-600">
              Importez facilement des contacts à partir d'un fichier CSV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contacts;
