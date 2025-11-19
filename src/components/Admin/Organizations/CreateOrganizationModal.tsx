import React, { useState } from 'react';
import { X, Building2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalLogoUrl = logoUrl;

      // Upload logo file if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `org-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrl;
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug: slug || null,
          logo_url: finalLogoUrl || null
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add current user as owner
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && org) {
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
          });

        if (memberError) throw memberError;

        // Update user profile with organization_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: org.id })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      setName('');
      setSlug('');
      setLogoUrl('');
      setLogoFile(null);
      setLogoPreview('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating organization:', err);
      alert('Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Créer une organisation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nom de l'organisation *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug (optionnel)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="acme-inc"
            />
            <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Logo de l'organisation
            </label>
            
            <div className="border-2 border-dashed border-input rounded-lg p-4 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload-org"
              />
              <label htmlFor="logo-upload-org" className="cursor-pointer">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="max-h-20 mx-auto rounded" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-foreground">Cliquez pour uploader un logo</span>
                    <span className="text-xs text-muted-foreground mt-1">ou entrez une URL ci-dessous</span>
                  </div>
                )}
              </label>
            </div>

            <div className="mt-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                placeholder="Ou entrez une URL: https://..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-border bg-background text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
