-- Migration partie 1: Ajouter les types manquants à l'enum game_type
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'scratch';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'form';