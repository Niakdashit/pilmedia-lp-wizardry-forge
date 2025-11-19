import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useMediaPartner } from '@/hooks/media/useMediaPartner';
import { usePartnershipRequests } from '@/hooks/media/usePartnershipRequests';
import { useMediaCampaigns } from '@/hooks/media/useMediaCampaigns';
import { Inbox, PlayCircle, History, Mail, CheckCircle2, XCircle, Globe, MessageSquare } from 'lucide-react';
import PageHeader from '@/components/Layout/PageHeader';

const MediaPortal: React.FC = () => {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'requests'|'campaigns'|'history'>('requests');
  const { partner, loading: partnerLoading } = useMediaPartner();
  const { requests, loading: reqLoading, respondToRequest } = usePartnershipRequests();
  const { campaigns, loading: campLoading } = useMediaCampaigns();

  const isAdminOrMedia = !!profile?.is_admin || !!profile?.is_media;

  if (!isAdminOrMedia) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-700">Accès réservé aux médias partenaires et administrateurs.</p>
        </div>
      </div>
    );
  }

  const TabButton = ({id, label, icon}: {id: 'requests'|'campaigns'|'history', label: string, icon: React.ReactNode}) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === id ? 'border-[#44444d] text-[#44444d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader 
        title="Espace Média"
      >
        <p className="text-base text-muted-foreground">{partnerLoading ? 'Chargement du profil média…' : partner?.name || 'Profil média non configuré'}</p>
      </PageHeader>

      <div className="px-6 sm:px-8 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <TabButton id="requests" label="Demandes" icon={<Inbox className="w-4 h-4" />} />
            <TabButton id="campaigns" label="Campagnes en ligne" icon={<PlayCircle className="w-4 h-4" />} />
            <TabButton id="history" label="Historique" icon={<History className="w-4 h-4" />} />
          </nav>
        </div>

        <div className="space-y-6">
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Demandes de partenariat</h2>
            </div>
            <div className="divide-y">
              {reqLoading && (
                <div className="p-6 text-gray-600">Chargement…</div>
              )}
              {!reqLoading && requests.length === 0 && (
                <div className="p-6 text-gray-600">Aucune demande reçue pour le moment.</div>
              )}
              {requests.map((r) => (
                <div key={r.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Globe className="w-4 h-4 text-[#44444d]" />
                      <span>Campagne #{r.campaign_id.slice(0,8)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {r.requester?.email || '—'}
                    </div>
                    {r.message && (
                      <div className="mt-2 text-sm text-gray-700 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5" />
                        <span>{r.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === 'pending' ? (
                      <>
                        <button onClick={() => respondToRequest(r.id, 'accepted')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4" /> Accepter
                        </button>
                        <button onClick={() => respondToRequest(r.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
                          <XCircle className="w-4 h-4" /> Refuser
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.status==='accepted' ? 'bg-green-100 text-green-800' : r.status==='rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Campagnes en ligne</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
              {campLoading && <div className="text-gray-600">Chargement…</div>}
              {!campLoading && campaigns.length === 0 && <div className="text-gray-600">Aucune campagne en ligne</div>}
              {campaigns.filter(c => c.status==='active').map((c) => (
                <div key={c.id} className="border rounded-xl p-4">
                  <div className="font-medium text-gray-900">Campagne #{c.campaign_id.slice(0,8)}</div>
                  <div className="text-sm text-gray-600 mt-1">Vues: {c.views} · Clics: {c.clicks} · Conversions: {c.conversions}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Historique des campagnes</h2>
            </div>
            <div className="divide-y">
              {campLoading && <div className="p-6 text-gray-600">Chargement…</div>}
              {!campLoading && campaigns.filter(c => c.status!=='active').length === 0 && (
                <div className="p-6 text-gray-600">Aucun historique</div>
              )}
              {campaigns.filter(c => c.status!=='active').map(c => (
                <div key={c.id} className="p-6 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Campagne #{c.campaign_id.slice(0,8)}</div>
                    <div className="text-sm text-gray-600 mt-1">Statut: {c.status}</div>
                  </div>
                  <div className="text-sm text-gray-600">Vues: {c.views} · Clics: {c.clicks}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default MediaPortal;
