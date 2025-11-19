import React from 'react';
import { Building2, Mail, Server } from 'lucide-react';

const LegalNotice: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Mentions Légales</h1>
          <p className="text-sm text-muted-foreground">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique
          </p>
        </div>

        <div className="space-y-8 text-foreground">
          {/* Éditeur du site */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Éditeur du Site</h2>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <div>
                <h3 className="font-medium mb-1">Raison sociale</h3>
                <p className="text-muted-foreground">Prosplay</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Contact</h3>
                <p className="text-muted-foreground">contact@prosplay.fr</p>
              </div>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Directeur de la Publication</h2>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Nom :</strong> [Nom du directeur de publication]<br />
                <strong>Qualité :</strong> [Fonction - ex: Président, Gérant]
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Nous Contacter</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:contact@prosplay.fr" className="text-sm text-primary hover:underline">
                    contact@prosplay.fr
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Hébergeur */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Hébergement</h2>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <div>
                <h3 className="font-medium mb-1">Hébergeur</h3>
                <p className="text-muted-foreground">Supabase Inc.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Adresse</h3>
                <p className="text-muted-foreground">
                  970 Toa Payoh North #07-04<br />
                  Singapore 318992
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Site web</h3>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://supabase.com
                </a>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Infrastructure :</strong> Les données sont hébergées dans l'Union Européenne 
                  (data centers certifiés ISO 27001 et conformes RGPD)
                </p>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Propriété Intellectuelle</h2>
            <p className="text-muted-foreground mb-4">
              L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, bases de données) 
              est la propriété exclusive de [Nom de l'entreprise] ou de ses partenaires.
            </p>
            <p className="text-muted-foreground mb-4">
              Toute reproduction, représentation, modification, publication, adaptation totale ou partielle 
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans 
              l'autorisation écrite préalable de [Nom de l'entreprise].
            </p>
            <p className="text-muted-foreground">
              Toute exploitation non autorisée du site ou de l'un des éléments qu'il contient sera 
              considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions 
              des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Protection des Données Personnelles</h2>
            <p className="text-muted-foreground mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              « Informatique et Libertés », vous disposez de droits sur vos données personnelles.
            </p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Responsable du traitement :</strong> [Nom de l'entreprise]
              </p>
              <p className="text-sm mb-2">
                <strong>Délégué à la Protection des Données (DPO) :</strong> 
                <a href="mailto:dpo@example.com" className="text-primary hover:underline ml-1">
                  dpo@example.com
                </a>
              </p>
              <p className="text-sm">
                Pour en savoir plus, consultez notre 
                <a href="/privacy" className="text-primary hover:underline ml-1">
                  Politique de Confidentialité
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques. 
              Conformément à la directive européenne 2009/136/CE, vous pouvez refuser l'utilisation de cookies 
              non essentiels via notre bandeau de consentement.
            </p>
            <p className="text-muted-foreground">
              Pour gérer vos préférences de cookies, accédez à votre espace personnel ou cliquez sur le lien 
              « Gérer mes cookies » en bas de page.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation de Responsabilité</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">8.1 Contenu du site</h3>
                <p className="text-muted-foreground text-sm">
                  [Nom de l'entreprise] s'efforce d'assurer l'exactitude et la mise à jour des informations 
                  diffusées sur ce site, mais ne peut garantir l'exactitude, la précision ou l'exhaustivité 
                  des informations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">8.2 Disponibilité</h3>
                <p className="text-muted-foreground text-sm">
                  [Nom de l'entreprise] ne peut être tenu responsable en cas d'interruption du site, 
                  de dysfonctionnement, de modification ou de suspension du service pour maintenance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">8.3 Liens hypertextes</h3>
                <p className="text-muted-foreground text-sm">
                  Ce site peut contenir des liens vers des sites tiers. [Nom de l'entreprise] n'exerce 
                  aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                </p>
              </div>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Droit Applicable</h2>
            <p className="text-muted-foreground mb-4">
              Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut 
              d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles 
              de compétence en vigueur.
            </p>
          </section>

          {/* Médiation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Médiation</h2>
            <p className="text-muted-foreground mb-4">
              Conformément à l'article L.612-1 du Code de la consommation, nous proposons un dispositif 
              de médiation de la consommation. L'entité de médiation retenue est :
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm mb-2">
                <strong>[Nom du médiateur]</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Adresse : [Adresse du médiateur]
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Site web : <a href="#" className="text-primary hover:underline">[URL]</a>
              </p>
            </div>
          </section>

          {/* Crédits */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Crédits</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Conception et développement :</strong> [Nom de l'entreprise]</p>
              <p><strong>Framework :</strong> React, TypeScript</p>
              <p><strong>Infrastructure :</strong> Supabase</p>
              <p><strong>Icônes :</strong> Lucide React</p>
            </div>
          </section>

          {/* Mise à jour */}
          <section className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Dernière Mise à Jour</h2>
            <p className="text-muted-foreground">
              Ces mentions légales ont été mises à jour le {new Date().toLocaleDateString('fr-FR')}.
            </p>
            <p className="text-muted-foreground mt-2">
              Nous nous réservons le droit de les modifier à tout moment pour refléter les changements 
              dans nos pratiques ou pour des raisons légales.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
