
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/common/Button';

const AdminReports: React.FC = () => {
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Rapports & Exports"
        size="sm"
        actions={
          <div className="flex gap-x-4">
            <Link to="/admin">
              <Button
                variant="primary"
                className="px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour Dashboard
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapports & Exports</h3>
            <p className="text-gray-500 mb-6">
              Génération de rapports personnalisés,<br />
              exports CSV/PDF et rapports programmés.
            </p>
            <p className="text-sm text-gray-400">Page en cours de développement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
