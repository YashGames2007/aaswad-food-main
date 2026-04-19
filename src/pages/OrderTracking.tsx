import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import type { OrderStatus } from '@/types';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'out-for-delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

const OrderTracking = () => {
  const { activeOrder } = useStore();
  const navigate = useNavigate();

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">No active order</p>
        <button onClick={() => navigate('/')} className="text-primary font-semibold">Go Home</button>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.status === activeOrder.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Order Status</h1>
      </div>

      <div className="px-4">
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <p className="text-sm text-muted-foreground">{activeOrder.id}</p>
          <p className="font-semibold text-foreground">{activeOrder.slot.label} · {activeOrder.location}</p>
        </div>

        <div className="space-y-0 pl-2">
          {STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className={`w-6 h-6 ${isCurrent ? 'text-primary' : 'text-success'}`} />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/30" />
                  )}
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 ${i < currentIdx ? 'bg-success' : 'bg-muted'}`} />
                  )}
                </div>
                <div className="pb-10">
                  <p className={`font-medium text-sm ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary mt-0.5">Current</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
