-- Script pour définir jonanzau9@gmail.com comme admin
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  last_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer les policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Insérer ou mettre à jour le profil admin
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'jonanzau9@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = now();

-- 5. Vérifier que ça a fonctionné
SELECT id, email, role, created_at 
FROM profiles 
WHERE email = 'jonanzau9@gmail.com';
