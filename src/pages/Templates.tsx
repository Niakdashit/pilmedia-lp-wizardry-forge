import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

export default function Templates() {
  const { templates, loading } = useTemplates();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(search) ||
      (template.description && template.description.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Templates de Campagnes</h1>
        </div>
        
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>

        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/wizard?templateId=${template.id}`)}>
                {template.thumbnail_url && (
                  <img src={template.thumbnail_url} alt={template.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">
                    {template.type}
                  </span>
                  {template.is_premium && (
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">Premium</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun template trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
