import { useStore } from '@/store/useStore';
import { ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingCart = () => {
  const cart = useStore((s) => s.cart);
  const navigate = useNavigate();
  const location = useLocation();

  if (cart.length === 0 || location.pathname === '/cart') return null;

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-primary text-primary-foreground rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg animate-slide-up safe-bottom z-50 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-5 h-5" />
        <span className="font-semibold">{count} item{count > 1 ? 's' : ''}</span>
      </div>
      <span className="font-bold text-lg">₹{total}</span>
    </button>
  );
};

export default FloatingCart;
