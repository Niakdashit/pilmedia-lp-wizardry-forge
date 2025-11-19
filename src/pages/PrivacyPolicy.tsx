import React from 'react';
import { Shield, Database, Cookie, UserCheck, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="space-y-8 text-foreground">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Introduction</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              La présente politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois applicables en matière de protection des données.
            </p>
          </section>

          {/* Responsable du traitement */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Responsable du Traitement</h2>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>Raison sociale :</strong> Prosplay
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Email :</strong> <a href="mailto:contact@prosplay.fr" className="text-primary hover:underline">contact@prosplay.fr</a>
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. Données Personnelles Collectées</h2>
            </div>
            
            <h3 className="text-xl font-medium mb-3 mt-6">2.1 Données d'identification</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Entreprise (optionnel)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Données de navigation</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Système d'exploitation</li>
              <li>Pages visitées</li>
              <li>Durée de visite</li>
              <li>Référent</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3 Données de participation</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Réponses aux formulaires de campagne</li>
              <li>Résultats de jeux et quiz</li>
              <li>Historique de participation</li>
              <li>Consentements marketing</li>
            </ul>
          </section>

          {/* Finalités */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Finalités du Traitement</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-2">Gestion des campagnes marketing</h3>
                <p className="text-sm text-muted-foreground">
                  Base légale : Consentement (Art. 6.1.a RGPD) et exécution du contrat (Art. 6.1.b RGPD)
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-2">Analyse et statistiques</h3>
                <p className="text-sm text-muted-foreground">
                  Base légale : Intérêt légitime (Art. 6.1.f RGPD)
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-2">Communication marketing</h3>
                <p className="text-sm text-muted-foreground">
                  Base légale : Consentement explicite (Art. 6.1.a RGPD)
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium mb-2">Sécurité et prévention de la fraude</h3>
                <p className="text-sm text-muted-foreground">
                  Base légale : Intérêt légitime (Art. 6.1.f RGPD)
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cookie className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Cookies et Technologies Similaires</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies via notre bandeau de consentement.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Cookies strictement nécessaires :</strong> Toujours actifs (fonctionnement du site)</p>
              <p className="text-sm"><strong>Cookies analytiques :</strong> Avec votre consentement (mesure d'audience)</p>
              <p className="text-sm"><strong>Cookies marketing :</strong> Avec votre consentement (personnalisation)</p>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Partage des Données</h2>
            <p className="text-muted-foreground mb-4">
              Vos données personnelles peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Prestataires techniques :</strong> Hébergement (Supabase), emails, analyse</li>
              <li><strong>Partenaires média :</strong> Uniquement avec votre consentement explicite</li>
              <li><strong>Autorités légales :</strong> Si requis par la loi</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          {/* Conservation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Durée de Conservation</h2>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Données de compte :</strong> Durée du compte + 1 an</p>
              <p className="text-sm"><strong>Données de participation :</strong> 3 ans après la campagne</p>
              <p className="text-sm"><strong>Consentements :</strong> 3 ans à partir du dernier consentement</p>
              <p className="text-sm"><strong>Logs techniques :</strong> 12 mois maximum</p>
            </div>
          </section>

          {/* Droits */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">7. Vos Droits RGPD</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit d'accès</h3>
                <p className="text-sm text-muted-foreground">Obtenir une copie de vos données</p>
              </div>
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit de rectification</h3>
                <p className="text-sm text-muted-foreground">Corriger vos données inexactes</p>
              </div>
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit à l'effacement</h3>
                <p className="text-sm text-muted-foreground">Supprimer vos données</p>
              </div>
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit à la portabilité</h3>
                <p className="text-sm text-muted-foreground">Récupérer vos données en format standard</p>
              </div>
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit d'opposition</h3>
                <p className="text-sm text-muted-foreground">S'opposer à certains traitements</p>
              </div>
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Droit à la limitation</h3>
                <p className="text-sm text-muted-foreground">Limiter le traitement de vos données</p>
              </div>
            </div>
            <div className="mt-6 bg-primary/10 p-4 rounded-lg flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Exercer vos droits</p>
                <p className="text-sm text-muted-foreground">
                  Pour exercer vos droits, contactez-nous à <a href="mailto:privacy@example.com" className="text-primary hover:underline">privacy@example.com</a>
                  <br />ou via votre <a href="/profile" className="text-primary hover:underline">espace personnel</a>.
                </p>
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Sécurité des Données</h2>
            <p className="text-muted-foreground mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Authentification sécurisée</li>
              <li>Contrôles d'accès stricts</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et audits de sécurité</li>
            </ul>
          </section>

          {/* Transferts internationaux */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Transferts Internationaux</h2>
            <p className="text-muted-foreground">
              Nos serveurs sont hébergés dans l'Union Européenne (Supabase). Aucun transfert de données hors UE n'est effectué 
              sans garanties appropriées (clauses contractuelles types, Privacy Shield, etc.).
            </p>
          </section>

          {/* Réclamation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Droit de Réclamation</h2>
            <p className="text-muted-foreground">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="text-sm mb-2">
                <strong>CNIL - Commission Nationale de l'Informatique et des Libertés</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
                Téléphone : 01 53 73 22 22<br />
                Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Modifications de la Politique</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification substantielle vous sera notifiée par email ou via une notification sur notre plateforme.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email :</strong> <a href="mailto:contact@prosplay.fr" className="text-primary hover:underline">contact@prosplay.fr</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
