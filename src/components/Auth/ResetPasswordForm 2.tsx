import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSwitchToLogin }) => {
  const { resetPassword, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
            <p className="text-gray-600 mb-6">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.<br />
              Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full bg-gradient-to-r from-[#841b60] to-[#b41b60] text-white py-3 px-4 rounded-xl font-medium hover:from-[#6d164f] hover:to-[#9a1b4f] focus:ring-2 focus:ring-offset-2 focus:ring-[#841b60] transition-all duration-200"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onSwitchToLogin}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
            <p className="text-gray-600">Réinitialisez votre mot de passe</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#841b60] focus:border-transparent transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#841b60] to-[#b41b60] text-white py-3 px-4 rounded-xl font-medium hover:from-[#6d164f] hover:to-[#9a1b4f] focus:ring-2 focus:ring-offset-2 focus:ring-[#841b60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-[#841b60] hover:text-[#6d164f] font-medium"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};
