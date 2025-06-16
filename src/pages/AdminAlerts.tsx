
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';

const AdminAlerts: React.FC = () => {
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Alertes & Automatisation"
        size="sm"
        actions={
          <div className="flex gap-x-4">
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour Dashboard
            </Link>
          </div>
        }
      />

      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Alertes & Automatisation</h3>
            <p className="text-gray-500 mb-6">
              Configuration des règles d'alerte automatiques,<br />
              intégrations Slack/Email et journal des automatisations.
            </p>
            <p className="text-sm text-gray-400">Page en cours de développement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;
