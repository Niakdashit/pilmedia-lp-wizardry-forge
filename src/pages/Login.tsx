
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Pour le moment, on redirige directement vers le dashboard
    navigate('/');
  };

  const handleAdminLogin = () => {
    // Redirection directe vers l'interface admin
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9f1fd] via-[#f3e8fa] to-[#c4e0f9] flex items-center justify-center p-4">
      {/* Décorations de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-lg"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Carte de connexion */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/25 p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <img src={logo} alt="Leadya Logo" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#841b60] mb-2">Bienvenue sur Leadya</h1>
            <p className="text-gray-600">Connectez-vous pour accéder à votre dashboard</p>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent bg-white/90 backdrop-blur-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent bg-white/90 backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="w-full bg-[#841b60] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Se connecter
            </button>
          </form>

          {/* Séparateur */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Accès admin */}
          <button
            onClick={handleAdminLogin}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Accès Administrateur
          </button>

          {/* Liens */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-sm text-[#841b60] hover:underline block">
              Mot de passe oublié ?
            </a>
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <a href="#" className="text-[#841b60] hover:underline">
                Contactez-nous
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
