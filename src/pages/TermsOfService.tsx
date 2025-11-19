import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="space-y-8 text-foreground">
          {/* Préambule */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Préambule</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
              de création et gestion de campagnes marketing interactives. En utilisant notre service, vous acceptez 
              sans réserve les présentes CGU.
            </p>
          </section>

          {/* Article 1 - Définitions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 1 - Définitions</h2>
            <div className="space-y-3">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm"><strong>« Plateforme » :</strong> Désigne l'ensemble des services accessibles via le site web et ses API</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm"><strong>« Utilisateur » :</strong> Toute personne physique ou morale utilisant la Plateforme</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm"><strong>« Campagne » :</strong> Tout jeu, quiz, formulaire ou opération marketing créé via la Plateforme</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm"><strong>« Participant » :</strong> Toute personne interagissant avec une Campagne</p>
              </div>
            </div>
          </section>

          {/* Article 2 - Objet */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 2 - Objet</h2>
            <p className="text-muted-foreground">
              La Plateforme permet aux Utilisateurs de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
              <li>Créer et personnaliser des campagnes marketing interactives</li>
              <li>Gérer des dotations et attribution de gains</li>
              <li>Collecter et analyser des données de participation</li>
              <li>Intégrer les campagnes sur des sites web tiers</li>
              <li>Gérer des partenariats média</li>
            </ul>
          </section>

          {/* Article 3 - Inscription et Compte */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Article 3 - Inscription et Compte Utilisateur</h2>
            </div>
            
            <h3 className="text-xl font-medium mb-3 mt-6">3.1 Conditions d'inscription</h3>
            <p className="text-muted-foreground mb-3">
              L'inscription est réservée aux personnes majeures et aux personnes morales. L'Utilisateur garantit 
              l'exactitude des informations fournies lors de l'inscription.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">3.2 Sécurité du compte</h3>
            <p className="text-muted-foreground mb-3">
              L'Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités 
              réalisées via son compte. Toute utilisation non autorisée doit être signalée immédiatement.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">3.3 Suspension et résiliation</h3>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, 
              sans préavis ni indemnité.
            </p>
          </section>

          {/* Article 4 - Services proposés */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 4 - Services Proposés</h2>
            
            <h3 className="text-xl font-medium mb-3">4.1 Fonctionnalités gratuites</h3>
            <p className="text-muted-foreground mb-3">
              Version d'essai limitée avec fonctionnalités de base pour tester la plateforme.
            </p>

            <h3 className="text-xl font-medium mb-3">4.2 Fonctionnalités premium</h3>
            <p className="text-muted-foreground mb-3">
              Accès complet selon l'offre souscrite. Les tarifs sont disponibles sur notre page pricing.
            </p>

            <h3 className="text-xl font-medium mb-3">4.3 Disponibilité</h3>
            <p className="text-muted-foreground">
              Nous nous efforçons d'assurer une disponibilité de 99,9% mais ne garantissons pas un accès 
              ininterrompu. Des maintenances programmées seront notifiées à l'avance.
            </p>
          </section>

          {/* Article 5 - Obligations de l'Utilisateur */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Article 5 - Obligations de l'Utilisateur</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">L'Utilisateur s'engage à :</p>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-1">Conformité légale</h3>
                <p className="text-sm text-muted-foreground">
                  Respecter toutes les lois applicables, notamment le RGPD, la législation sur les jeux et loteries
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-1">Contenu approprié</h3>
                <p className="text-sm text-muted-foreground">
                  Ne pas créer de campagnes à caractère illégal, diffamatoire, discriminatoire ou contraire aux bonnes mœurs
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-1">Usage normal</h3>
                <p className="text-sm text-muted-foreground">
                  Ne pas tenter de contourner les limitations techniques, ni perturber le fonctionnement de la Plateforme
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-1">Protection des données</h3>
                <p className="text-sm text-muted-foreground">
                  Obtenir les consentements nécessaires auprès des Participants et respecter leurs droits RGPD
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 - Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 6 - Propriété Intellectuelle</h2>
            
            <h3 className="text-xl font-medium mb-3">6.1 Droits sur la Plateforme</h3>
            <p className="text-muted-foreground mb-3">
              Tous les éléments de la Plateforme (code, design, marques, logos) sont protégés par les droits 
              de propriété intellectuelle et restent notre propriété exclusive.
            </p>

            <h3 className="text-xl font-medium mb-3">6.2 Contenu utilisateur</h3>
            <p className="text-muted-foreground mb-3">
              L'Utilisateur conserve tous les droits sur le contenu qu'il crée. Il nous accorde toutefois 
              une licence non-exclusive pour héberger, reproduire et afficher ce contenu dans le cadre du service.
            </p>

            <h3 className="text-xl font-medium mb-3">6.3 Licence d'utilisation</h3>
            <p className="text-muted-foreground">
              Nous accordons à l'Utilisateur une licence limitée, non-exclusive, non-transférable pour 
              utiliser la Plateforme conformément aux présentes CGU.
            </p>
          </section>

          {/* Article 7 - Données personnelles */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 7 - Données Personnelles</h2>
            <p className="text-muted-foreground mb-4">
              Le traitement des données personnelles est régi par notre 
              <a href="/privacy" className="text-primary hover:underline ml-1">Politique de Confidentialité</a>, 
              conforme au RGPD.
            </p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Responsabilité conjointe :</strong> Pour les données collectées via les Campagnes, 
                l'Utilisateur et nous-mêmes agissons en tant que responsables conjoints du traitement. 
                L'Utilisateur reste responsable des consentements collectés et de l'information des Participants.
              </p>
            </div>
          </section>

          {/* Article 8 - Tarification */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 8 - Tarification et Paiement</h2>
            
            <h3 className="text-xl font-medium mb-3">8.1 Tarifs</h3>
            <p className="text-muted-foreground mb-3">
              Les tarifs sont disponibles sur notre site et peuvent être modifiés à tout moment. 
              Les modifications ne s'appliquent pas aux abonnements en cours.
            </p>

            <h3 className="text-xl font-medium mb-3">8.2 Modalités de paiement</h3>
            <p className="text-muted-foreground mb-3">
              Paiement par carte bancaire ou virement. Facturation mensuelle ou annuelle selon l'offre choisie.
            </p>

            <h3 className="text-xl font-medium mb-3">8.3 Rétractation</h3>
            <p className="text-muted-foreground">
              Conformément à la législation, vous disposez d'un délai de rétractation de 14 jours, 
              sauf si vous avez commencé à utiliser le service.
            </p>
          </section>

          {/* Article 9 - Responsabilité */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Article 9 - Limitation de Responsabilité</h2>
            </div>
            
            <h3 className="text-xl font-medium mb-3">9.1 Disponibilité</h3>
            <p className="text-muted-foreground mb-3">
              Nous ne garantissons pas un accès ininterrompu et ne serons pas responsables des dommages 
              résultant d'une indisponibilité temporaire.
            </p>

            <h3 className="text-xl font-medium mb-3">9.2 Contenu utilisateur</h3>
            <p className="text-muted-foreground mb-3">
              L'Utilisateur est seul responsable du contenu de ses Campagnes et de leur conformité 
              avec la législation applicable.
            </p>

            <h3 className="text-xl font-medium mb-3">9.3 Dommages indirects</h3>
            <p className="text-muted-foreground">
              Notre responsabilité ne saurait être engagée pour les dommages indirects (perte de chiffre d'affaires, 
              de données, d'opportunité commerciale, etc.).
            </p>
          </section>

          {/* Article 10 - Force majeure */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 10 - Force Majeure</h2>
            <p className="text-muted-foreground">
              Nous ne serons pas tenus responsables de tout retard ou inexécution résultant d'un cas de force majeure, 
              notamment : catastrophes naturelles, guerres, grèves, pannes de réseau, cyberattaques majeures, 
              décisions gouvernementales.
            </p>
          </section>

          {/* Article 11 - Modification des CGU */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 11 - Modification des CGU</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications 
              substantielles seront notifiées par email 30 jours avant leur entrée en vigueur. L'utilisation 
              continue de la Plateforme après cette période vaut acceptation des nouvelles CGU.
            </p>
          </section>

          {/* Article 12 - Résiliation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 12 - Résiliation</h2>
            
            <h3 className="text-xl font-medium mb-3">12.1 Par l'Utilisateur</h3>
            <p className="text-muted-foreground mb-3">
              L'Utilisateur peut résilier son compte à tout moment depuis son espace personnel, 
              avec effet à la fin de la période de facturation en cours.
            </p>

            <h3 className="text-xl font-medium mb-3">12.2 Par nous-mêmes</h3>
            <p className="text-muted-foreground mb-3">
              Nous pouvons résilier un compte en cas de violation grave des CGU, avec préavis de 15 jours 
              sauf urgence (fraude, atteinte à la sécurité).
            </p>

            <h3 className="text-xl font-medium mb-3">12.3 Effets de la résiliation</h3>
            <p className="text-muted-foreground">
              Après résiliation, l'Utilisateur dispose de 30 jours pour exporter ses données. 
              Passé ce délai, toutes les données seront définitivement supprimées.
            </p>
          </section>

          {/* Article 13 - Droit applicable */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Article 13 - Droit Applicable et Litiges</h2>
            <p className="text-muted-foreground mb-3">
              Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la compétence 
              exclusive des tribunaux français.
            </p>
            <p className="text-muted-foreground">
              Conformément à la réglementation, vous pouvez recourir à une médiation conventionnelle ou à 
              tout autre mode alternatif de règlement des différends en cas de contestation.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant ces conditions générales d'utilisation :
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email :</strong> <a href="mailto:legal@example.com" className="text-primary hover:underline">legal@example.com</a></p>
              <p className="text-sm"><strong>Adresse :</strong> [Adresse complète]</p>
              <p className="text-sm"><strong>Téléphone :</strong> [Numéro de téléphone]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
