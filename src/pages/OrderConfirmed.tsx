import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const OrderConfirmed = () => {
  const { activeOrder } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="text-success mb-4">
        <CheckCircle2 className="w-20 h-20 mx-auto" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">Your food will be ready on time</p>

      {activeOrder && (
        <div className="bg-card rounded-2xl p-4 border border-border w-full max-w-sm space-y-2 text-left mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium text-foreground">{activeOrder.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Slot</span>
            <span className="font-medium text-foreground">{activeOrder.slot.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-foreground">{activeOrder.location}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-primary">₹{activeOrder.totalAmount}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 w-full max-w-sm">
        <button
          onClick={() => navigate('/track')}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-all"
        >
          Track Order
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl border border-border text-foreground font-medium active:scale-[0.98] transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmed;
