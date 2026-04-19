import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import SlotChips from '@/components/SlotChips';
import PaymentDialog from '@/components/PaymentDialog';
import { LOCATIONS } from '@/types';

const CartPage = () => {
  const { cart, removeFromCart, selectedSlot, selectedLocation, setSelectedLocation, placeOrder } = useStore();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'upi' | 'cod'>('upi');

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const canOrder = cart.length > 0 && selectedSlot;

  const openPayment = (type: 'upi' | 'cod') => {
    setPaymentType(type);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    placeOrder(paymentType);
    setPaymentOpen(false);
    navigate('/order-confirmed');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="text-primary font-semibold">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Your Cart</h1>
      </div>

      {/* Items */}
      <div className="px-4 space-y-2 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">{item.name}</p>
              {item.customizations && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.customizations.sabjis.join(', ')} · {item.customizations.rotiCount} rotis
                  {item.customizations.rice && ' · Rice'}
                </p>
              )}
              <p className="text-primary font-semibold text-sm mt-1">₹{item.price}</p>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-destructive/60 hover:text-destructive p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Slot */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Delivery Slot</h3>
        <SlotChips />
      </div>

      {/* Location */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Delivery Location</h3>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">₹{total}</span>
        </div>
        <button
          onClick={() => openPayment('upi')}
          disabled={!canOrder}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Pay via UPI – ₹{total}
        </button>
        <button
          onClick={() => openPayment('cod')}
          disabled={!canOrder}
          className="w-full py-2.5 rounded-xl border border-border text-foreground text-sm font-medium disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Cash on Delivery
        </button>
      </div>

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={total}
        paymentType={paymentType}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CartPage;
