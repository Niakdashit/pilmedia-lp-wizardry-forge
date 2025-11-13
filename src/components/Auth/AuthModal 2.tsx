import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthMode = 'login' | 'register' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');
  const switchToReset = () => setMode('reset');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex items-center justify-center min-h-[500px]">
            {mode === 'login' && (
              <LoginForm
                onSwitchToRegister={switchToRegister}
                onSwitchToReset={switchToReset}
              />
            )}
            {mode === 'register' && (
              <RegisterForm onSwitchToLogin={switchToLogin} />
            )}
            {mode === 'reset' && (
              <ResetPasswordForm onSwitchToLogin={switchToLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
