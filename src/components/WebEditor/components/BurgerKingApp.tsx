import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Crown, Home, UtensilsCrossed, Store, List, Lock, X, User, Percent, Coffee, Truck, Info, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BurgerKingApp() {
  const [activeTab, setActiveTab] = useState('Accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showKingdom, setShowKingdom] = useState(false);
  const [restaurant] = useState({ name: 'Osny', distance: '149 m', open: true });
  const [crowns] = useState(17);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'Menu') setMenuOpen(true);
  };

  const renderAccueil = () => (
    <section className="px-4 pb-4">
      {/* En ce moment */}
      <h3 className="font-bold text-lg text-[#5c2400] mb-2">En ce moment</h3>
      <Card className="overflow-hidden mb-6">
        <CardContent className="p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <img
              src="https://static.burgerking.fr/media/les-masters-montagnards.jpg"
              alt="Les Masters Montagnards"
              className="w-full h-56 object-cover"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Burger+King')}
            />
          </motion.div>
          <div className="p-4 text-center bg-[#fff8f1]">
            <h4 className="text-2xl font-bold text-[#4a1e00]">Les Masters Montagnards</h4>
            <p className="text-sm mt-1 text-[#4a1e00]">Le Montagnard Poulet & Le Montagnard Reblochon</p>
            <Button className="mt-3 bg-[#d62300] text-white hover:bg-[#b91c00]">J'en profite !</Button>
          </div>
        </CardContent>
      </Card>

      {/* Couronnes */}
      <Card className="mb-6 p-4 bg-[#fff4e0] border-0 shadow-sm">
        <h2 className="flex items-center gap-2 text-[#5c2400] text-lg font-bold">
          <Crown className="text-[#d62300]" /> {crowns} Couronnes
        </h2>
        <div className="flex justify-between items-center mt-3">
          {[40, 80, 120, 135, 150, 200, 240].map((value, i) => (
            <div key={i} className="flex flex-col items-center text-xs text-[#5c2400]">
              <Lock size={16} className="mb-1" />
              {value}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full mt-3 relative">
          <div className="absolute top-0 left-0 h-2 bg-[#d62300] rounded-full" style={{ width: `${(crowns / 240) * 100}%` }}></div>
        </div>
        <p className="text-sm mt-2 text-[#5c2400]">
          Plus que {40 - crowns} couronnes pour déverrouiller le prochain palier.
        </p>
      </Card>

      {/* Actualité Burger King */}
      <h3 className="font-bold text-lg text-[#5c2400] mb-2">L'actualité Burger King</h3>
      <Card className="overflow-hidden mb-6">
        <CardContent className="p-0">
          <img
            src="https://static.burgerking.fr/media/gabby-et-la-maison-magique.jpg"
            alt="Gabby et la maison magique"
            className="w-full h-56 object-cover"
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=King+Junior')}
          />
          <div className="p-3 bg-[#fff8f1] text-center">
            <h4 className="text-[#5c2400] font-semibold text-base">King Junior x Gabby et la Maison Magique</h4>
            <p className="text-xs text-[#5c2400] mt-1">Découvrez le jouet du moment offert avec le menu King Junior.</p>
          </div>
        </CardContent>
      </Card>

      {/* Sélectionnés pour vous */}
      <h3 className="font-bold text-lg text-[#5c2400] mb-3">Sélectionnés pour vous</h3>
      <div className="grid grid-cols-2 gap-4 pb-8">
        {[
          { name: 'Petit Toasté Bacon', img: 'https://static.burgerking.fr/media/petit-toaste-bacon.jpg' },
          { name: 'King Fusion Snickers', img: 'https://static.burgerking.fr/media/king-fusion-snickers.jpg' },
          { name: 'Veggie Steakhouse', img: 'https://static.burgerking.fr/media/veggie-steakhouse.jpg' },
          { name: 'Double Cheese Bacon XXL', img: 'https://static.burgerking.fr/media/double-cheese-bacon-xxl.jpg' },
        ].map((item, i) => (
          <Card key={i} className="text-center shadow-sm border-0 bg-white">
            <CardContent className="p-3">
              <h4 className="text-[#5c2400] font-bold text-base mb-2">{item.name}</h4>
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-28 object-contain"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Burger')}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );

  const renderKingdomCard = () => (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute bottom-0 left-0 w-full h-full bg-[#fff8f1] z-50 overflow-y-auto"
    >
      <div className="bg-[#5c2400] text-white p-4 flex items-center">
        <button onClick={() => setShowKingdom(false)} className="mr-2">←</button>
        <h1 className="text-xl font-bold">Ma carte Kingdom</h1>
      </div>

      <div className="text-center mt-6 px-6">
        <p className="text-[#5c2400] font-medium mb-4">
          Présentez votre carte Kingdom en borne ou en caisse,<br />pour vous identifier et profiter de vos privilèges.
        </p>

        <div className="bg-white rounded-xl border-4 border-[#ffa600] p-6 inline-block">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Burger_King_logo_2020.svg/512px-Burger_King_logo_2020.svg.png"
            alt="Kingdom logo"
            className="w-16 mx-auto mb-3"
          />
          <QrCode className="mx-auto w-40 h-40 text-[#5c2400]" />
          <p className="text-[#5c2400] font-bold text-lg mt-4">9GG N89 Z8D</p>
        </div>

        <div className="mt-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Apple_Wallet_logo.svg"
            alt="Apple Wallet"
            className="w-40 mx-auto"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderMenu = () => (
    <motion.div
      initial={{ x: '100%', backdropFilter: 'blur(0px)' }}
      animate={{ x: 0, backdropFilter: 'blur(4px)' }}
      exit={{ x: '100%', backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute top-0 right-0 w-full h-full bg-[#fff8f1]/95 z-50 overflow-y-auto"
    >
      <div className="bg-[#5c2400] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">BURGER KING</h1>
        <button onClick={() => setMenuOpen(false)}>
          <X className="text-white w-6 h-6" />
        </button>
      </div>

      <div
        onClick={() => setShowKingdom(true)}
        className="cursor-pointer bg-gradient-to-r from-[#0078d7] to-[#00b0f4] text-white p-4 m-4 rounded-xl hover:scale-[1.02] transition-transform"
      >
        <h2 className="font-bold text-lg">Mon kingdom</h2>
        <p className="text-sm">Mes avantages →</p>
        <div className="mt-2 bg-white/20 rounded-full px-3 py-1 w-fit text-sm">9GG N89 Z8D</div>
      </div>

      <div className="px-4 text-[#5c2400]">
        {[
          { label: 'The kingdom', icon: Crown },
          { label: 'Commande en Click & Collect', icon: Coffee },
          { label: 'Commande en King Table', icon: UtensilsCrossed },
          { label: 'Commande en King Delivery', icon: Truck },
          { label: 'Nouveautés', icon: Percent },
          { label: 'Notre carte', icon: List },
          { label: 'Coin Famille', icon: User },
          { label: 'Bons plans', icon: Percent },
          { label: 'Nos engagements Burger Kare', icon: Info },
          { label: 'Trouver un restaurant', icon: MapPin },
          { label: 'Nous rejoindre', icon: User },
          { label: 'Informations légales', icon: Info },
          { label: 'Informations clients', icon: Info },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-[#e0d6c5]">
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <span className="text-[#5c2400]">›</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 text-[#5c2400] text-2xl mt-6">
        <i className="fa-brands fa-facebook"></i>
        <i className="fa-brands fa-instagram"></i>
        <i className="fa-brands fa-x-twitter"></i>
        <i className="fa-brands fa-tiktok"></i>
      </div>

      <div className="p-6 text-center">
        <Button variant="outline" className="w-full mb-3 border-[#d62300] text-[#d62300]">Se déconnecter</Button>
        <Button variant="outline" className="w-full border-[#d62300] text-[#d62300]">Se déconnecter de tous les appareils</Button>
        <p className="text-xs text-[#5c2400] mt-4">Store version 11.8.0</p>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen bg-[#fff8f1] font-sans relative flex flex-col overflow-hidden">
      <div className="bg-[#5c2400] text-white p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl font-bold">BURGER KING</h1>
        <button onClick={() => setMenuOpen(true)} className="font-bold text-lg">☰</button>
      </div>

      <Card className="m-4 p-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="font-bold text-lg">{restaurant.name}</h2>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            {restaurant.open ? 'Ouvert' : 'Fermé'} • {restaurant.distance}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">J'y vais</Button>
          <Button className="bg-[#d62300] hover:bg-[#b91c00] text-white">Commander</Button>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>{activeTab === 'Accueil' && renderAccueil()}</AnimatePresence>
      </div>

      <AnimatePresence>{menuOpen && renderMenu()}</AnimatePresence>
      <AnimatePresence>{showKingdom && renderKingdomCard()}</AnimatePresence>

      <nav className="bg-white shadow-md flex justify-around py-2 border-t flex-shrink-0">
        {[
          { name: 'Accueil', icon: Home },
          { name: 'Carte', icon: UtensilsCrossed },
          { name: 'Commander', icon: Crown },
          { name: 'Restaurants', icon: Store },
          { name: 'Menu', icon: List },
        ].map((tab) => (
          <motion.button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center text-sm ${
              activeTab === tab.name ? 'text-[#d62300]' : 'text-[#5c2400]'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            {tab.name}
          </motion.button>
        ))}
      </nav>
    </div>
  );
}
