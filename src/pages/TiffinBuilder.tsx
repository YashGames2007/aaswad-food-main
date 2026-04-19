import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

const TiffinBuilder = () => {
  const { dailyMenu, addToCart } = useStore();
  const navigate = useNavigate();

  const [selectedSabjis, setSelectedSabjis] = useState<string[]>([]);
  const [rotiCount, setRotiCount] = useState(3);
  const [rice, setRice] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleSabji = (id: string) => {
    setSelectedSabjis((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const basePrice = 50;
  const rotiPrice = rotiCount * dailyMenu.rotis.price;
  const ricePrice = rice ? dailyMenu.rice.price : 0;
  const addonPrice = selectedAddons.reduce((sum, aId) => {
    const addon = dailyMenu.addons.find((a) => a.id === aId);
    return sum + (addon?.price || 0);
  }, 0);
  const total = basePrice + rotiPrice + ricePrice + addonPrice;

  const handleAddToCart = () => {
    const sabjiNames = selectedSabjis.map((id) => dailyMenu.sabjis.find((s) => s.id === id)?.name || '');
    const addonNames = selectedAddons.map((id) => dailyMenu.addons.find((a) => a.id === id)?.name || '');

    addToCart({
      id: `custom-${Date.now()}`,
      name: 'Custom Tiffin',
      price: total,
      quantity: 1,
      customizations: {
        sabjis: sabjiNames,
        rotiCount,
        rice,
        addons: addonNames,
      },
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Build Your Tiffin</h1>
      </div>

      {/* Sabji Selection */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-1">Select Sabji <span className="text-muted-foreground font-normal text-sm">(max 2)</span></h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {dailyMenu.sabjis.filter(s => s.available).map((sabji) => {
            const selected = selectedSabjis.includes(sabji.id);
            return (
              <button
                key={sabji.id}
                onClick={() => toggleSabji(sabji.id)}
                className={`p-3 rounded-xl border text-left text-sm font-medium transition-all active:scale-95
                  ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'}`}
              >
                {sabji.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roti Selector */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Rotis</h3>
        <div className="flex items-center gap-4 bg-card rounded-xl p-3 border border-border">
          <span className="text-sm text-foreground flex-1">Roti × {rotiCount}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRotiCount(Math.max(1, rotiCount - 1))}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-6 text-center">{rotiCount}</span>
            <button
              onClick={() => setRotiCount(Math.min(10, rotiCount + 1))}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-primary">₹{rotiPrice}</span>
        </div>
      </div>

      {/* Rice Toggle */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between bg-card rounded-xl p-3 border border-border">
          <span className="text-sm font-medium text-foreground">Steamed Rice</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">₹{dailyMenu.rice.price}</span>
            <button
              onClick={() => setRice(!rice)}
              className={`w-12 h-7 rounded-full transition-colors ${rice ? 'bg-primary' : 'bg-muted'} relative`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${rice ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Add-ons</h3>
        <div className="space-y-2">
          {dailyMenu.addons.map((addon) => {
            const selected = selectedAddons.includes(addon.id);
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all active:scale-[0.98]
                  ${selected ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
              >
                <span className="font-medium text-foreground">{addon.name}</span>
                <span className="font-semibold text-primary">₹{addon.price}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <button
          onClick={handleAddToCart}
          disabled={selectedSabjis.length === 0}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Add to Cart – ₹{total}
        </button>
      </div>
    </div>
  );
};

export default TiffinBuilder;
