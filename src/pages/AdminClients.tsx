
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import PageHeader from '../components/Layout/PageHeader';
import AdminClientsStats from '../components/Admin/AdminClients/AdminClientsStats';
import AdminClientsFilters from '../components/Admin/AdminClients/AdminClientsFilters';
import AdminClientsTable from '../components/Admin/AdminClients/AdminClientsTable';
import { Client } from '../components/Admin/AdminClients/types';

const AdminClients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const mockClients: Client[] = [
    {
      id: 'client1',
      name: 'Jean Dupont',
      email: 'jean.dupont@techcorp.com',
      company: 'TechCorp Solutions',
      phone: '+33 1 23 45 67 89',
      totalCampaigns: 12,
      activeCampaigns: 3,
      totalViews: 15420,
      avgConversionRate: 24.5,
      createdAt: '2024-01-15',
      lastActivity: '2025-01-10',
      status: 'active'
    },
    {
      id: 'client2',
      name: 'Marie Martin',
      email: 'marie@fashionbrand.fr',
      company: 'Fashion Brand',
      phone: '+33 1 98 76 54 32',
      totalCampaigns: 8,
      activeCampaigns: 2,
      totalViews: 9850,
      avgConversionRate: 31.2,
      createdAt: '2024-03-22',
      lastActivity: '2025-01-08',
      status: 'active'
    },
    {
      id: 'client3',
      name: 'Pierre Legrand',
      email: 'pierre@ecommerce-plus.com',
      company: 'E-commerce Plus',
      totalCampaigns: 15,
      activeCampaigns: 0,
      totalViews: 22100,
      avgConversionRate: 18.7,
      createdAt: '2023-11-10',
      lastActivity: '2024-12-15',
      status: 'inactive'
    }
  ];

  const filteredClients = mockClients
    .filter((client) => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Gestion des Clients"
        size="sm"
        actions={
          <div className="flex gap-x-4">
            <Link to="/admin">
              <Button
                variant="primary"
                className="px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour Admin
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-6">
        <AdminClientsStats clients={mockClients} />

        <div className="bg-white rounded-xl shadow-sm">
          <AdminClientsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
          <AdminClientsTable clients={filteredClients} />
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
