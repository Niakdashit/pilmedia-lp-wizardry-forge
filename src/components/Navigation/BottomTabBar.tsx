import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Gift, User, Monitor, Tablet, Smartphone } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomTabBarProps {
  variant?: 'public' | 'preview';
  items?: NavItem[];
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ variant = 'public', items }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const device = new URLSearchParams(location.search).get('device') || 'mobile';

  const defaultPublicItems: NavItem[] = [
    { to: '/', label: 'Accueil', icon: <Home className="w-5 h-5" /> },
    { to: '#', label: 'Jeu', icon: <Gift className="w-5 h-5" /> },
    { to: '#', label: 'Profil', icon: <User className="w-5 h-5" /> },
  ];

  const publicItems = items && items.length ? items : defaultPublicItems;

  const handleDeviceChange = (next: 'desktop' | 'tablet' | 'mobile') => {
    const params = new URLSearchParams(location.search);
    params.set('device', next);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
  };

  const isActivePath = (to: string) => {
    try {
      if (to === '#') return false;
      const url = new URL(to, window.location.origin);
      return url.pathname === location.pathname;
    } catch {
      return false;
    }
  };

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={variant === 'preview' ? 'Prévisualisation - sélection appareil' : 'Navigation principale'}
    >
      {variant === 'preview' ? (
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          <button
            onClick={() => handleDeviceChange('desktop')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-medium transition-colors ${
              device === 'desktop' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => handleDeviceChange('tablet')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-medium transition-colors ${
              device === 'tablet' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tablet className="w-5 h-5" />
            <span>Tablette</span>
          </button>
          <button
            onClick={() => handleDeviceChange('mobile')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-medium transition-colors ${
              device === 'mobile' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>Mobile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {publicItems.map((item) => (
            <a
              key={item.label}
              href={item.to}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-medium transition-colors ${
                isActivePath(item.to) ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default BottomTabBar;
