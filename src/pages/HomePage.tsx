import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import SlotChips from '@/components/SlotChips';
import FloatingCart from '@/components/FloatingCart';
import { MapPin, User, Plus } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';
import thaliRegular from '@/assets/thali-regular.jpg';
import thaliSpecial from '@/assets/thali-special.jpg';
import addonsImg from '@/assets/addons.jpg';

const THALI_IMAGES: Record<string, string> = {
  t1: thaliRegular,
  t2: thaliSpecial,
};

const ADDON_IMAGES: Record<string, string> = {
  a1: addonsImg,
  a2: addonsImg,
  a3: addonsImg,
  a4: addonsImg,
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HomePage = () => {
  const { user, dailyMenu, addToCart, selectedLocation } = useStore();
  const navigate = useNavigate();

  const handleAddThali = (thali: typeof dailyMenu.thalis[0]) => {
    addToCart({
      id: `${thali.id}-${Date.now()}`,
      name: thali.name,
      price: thali.price,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{getGreeting()} 👋</h2>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedLocation}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <User className="w-5 h-5 text-secondary-foreground" />
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-4 mb-4">
        <div className="relative rounded-2xl overflow-hidden h-36">
          <img src={heroBanner} alt="Home cooked food" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent flex flex-col justify-center pl-5">
            <p className="text-primary-foreground text-xs font-medium opacity-90">Skip the search</p>
            <h3 className="text-primary-foreground text-lg font-bold leading-tight">Eat on time,<br/>every time.</h3>
          </div>
        </div>
      </div>

      {/* Today's Menu Card */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h3 className="font-bold text-foreground">Today's Menu</h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {dailyMenu.sabjis.filter(s => s.available).map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {s.name}
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {dailyMenu.dal.name}
            </div>
          </div>
        </div>
      </div>

      {/* Slot Selector */}
      <div className="px-4 mb-5">
        <h3 className="font-bold text-foreground mb-2">⏰ Select Slot</h3>
        <SlotChips />
      </div>

      {/* Thali Cards */}
      <div className="px-4 space-y-3">
        <h3 className="font-bold text-foreground">🍱 Order</h3>

        {dailyMenu.thalis.map((thali) => (
          <div key={thali.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex">
              <div className="flex-1 p-4">
                <h4 className="font-semibold text-foreground">{thali.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  2 sabjis · dal · roti · rice
                </p>
                <p className="text-primary font-bold text-lg mt-2">₹{thali.price}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate('/builder')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary text-primary hover:bg-primary/5 active:scale-95 transition-all"
                  >
                    Customize
                  </button>
                  <button
                    onClick={() => handleAddThali(thali)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground active:scale-90 transition-transform flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </button>
                </div>
              </div>
              <div className="w-32 h-32 flex-shrink-0 relative">
                <img
                  src={THALI_IMAGES[thali.id] || thaliRegular}
                  alt={thali.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={256}
                  height={256}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add-ons */}
        <h3 className="font-bold text-foreground pt-2">🥄 Add-ons</h3>
        <div className="grid grid-cols-2 gap-3">
          {dailyMenu.addons.map((addon) => (
            <div key={addon.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="h-20 overflow-hidden">
                <img src={addonsImg} alt={addon.name} className="w-full h-full object-cover" loading="lazy" width={256} height={256} />
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{addon.name}</p>
                  <p className="text-primary font-semibold text-sm">₹{addon.price}</p>
                </div>
                <button
                  onClick={() => addToCart({ id: `${addon.id}-${Date.now()}`, name: addon.name, price: addon.price, quantity: 1 })}
                  className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default HomePage;
