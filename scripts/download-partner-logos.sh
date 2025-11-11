#!/bin/bash

# Script pour télécharger les logos des partenaires médias Prisma Media
# Usage: ./scripts/download-partner-logos.sh

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Téléchargement des logos des partenaires médias...${NC}\n"

# Créer le dossier de destination
LOGO_DIR="public/logos/partners"
mkdir -p "$LOGO_DIR"

# URLs des logos (à mettre à jour avec les vraies URLs une fois récupérées)
declare -A LOGOS=(
  ["geo"]="https://www.geo.fr/favicon.svg"
  ["capital"]="https://www.capital.fr/favicon.svg"
  ["femme-actuelle"]="https://www.femmeactuelle.fr/favicon.svg"
  ["cuisine-actuelle"]="https://www.cuisineactuelle.fr/favicon.svg"
  ["ca-minteresse"]="https://www.caminteresse.fr/favicon.svg"
  ["voici"]="https://www.voici.fr/favicon.svg"
  ["tele-loisirs"]="https://www.programme-tv.net/favicon.svg"
  ["tele-2-semaines"]="https://www.programme.tv/favicon.svg"
)

# Fonction pour télécharger un logo
download_logo() {
  local name=$1
  local url=$2
  local output="$LOGO_DIR/${name}-logo.svg"
  
  echo -e "${BLUE}Téléchargement de ${name}...${NC}"
  
  if curl -L -s -o "$output" "$url"; then
    echo -e "${GREEN}✓ ${name} téléchargé${NC}"
  else
    echo -e "${RED}✗ Échec du téléchargement de ${name}${NC}"
  fi
}

# Télécharger tous les logos
for name in "${!LOGOS[@]}"; do
  download_logo "$name" "${LOGOS[$name]}"
done

echo -e "\n${GREEN}✅ Téléchargement terminé !${NC}"
echo -e "${BLUE}📁 Les logos sont dans : ${LOGO_DIR}${NC}\n"

# Instructions pour la suite
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo "1. Vérifier les logos téléchargés dans $LOGO_DIR"
echo "2. Remplacer les favicons par les vrais logos si nécessaire"
echo "3. Exécuter la migration SQL dans Supabase"
echo "4. Mettre à jour les URLs dans la migration si besoin"
echo ""
echo -e "${BLUE}💡 Note :${NC} Les URLs actuelles pointent vers les favicons."
echo "Pour obtenir les vrais logos, visitez https://www.prismamedia.com/marques/"
