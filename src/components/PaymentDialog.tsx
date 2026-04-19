import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Smartphone, Banknote } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  paymentType: 'upi' | 'cod';
  onSuccess: () => void;
}

type Stage = 'idle' | 'processing' | 'success';

const PaymentDialog = ({ open, onOpenChange, amount, paymentType, onSuccess }: PaymentDialogProps) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [upiId, setUpiId] = useState('test@upi');

  const handlePay = () => {
    setStage('processing');
    // Simulate payment gateway processing
    setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        onSuccess();
        setStage('idle');
      }, 900);
    }, 1600);
  };

  const handleClose = (v: boolean) => {
    if (stage === 'processing') return; // prevent close during processing
    if (!v) setStage('idle');
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentType === 'upi' ? <Smartphone className="w-5 h-5 text-primary" /> : <Banknote className="w-5 h-5 text-primary" />}
            {paymentType === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
          </DialogTitle>
          <DialogDescription>
            {paymentType === 'upi' ? 'Test mode — no real money will be charged.' : 'Pay in cash when your order arrives.'}
          </DialogDescription>
        </DialogHeader>

        {stage === 'idle' && (
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Amount Payable</p>
              <p className="text-3xl font-bold text-primary mt-1">₹{amount}</p>
            </div>

            {paymentType === 'upi' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">UPI ID</label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">Demo: any UPI ID works in test mode</p>
              </div>
            )}

            <button
              onClick={handlePay}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-all"
            >
              {paymentType === 'upi' ? `Pay ₹${amount}` : `Confirm Order – ₹${amount}`}
            </button>
            <p className="text-[10px] text-center text-muted-foreground">
              🔒 Secured by Aaswad · Test Gateway
            </p>
          </div>
        )}

        {stage === 'processing' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-medium text-foreground">Processing payment…</p>
            <p className="text-xs text-muted-foreground">Please wait, do not close this window</p>
          </div>
        )}

        {stage === 'success' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-success" />
            <p className="font-semibold text-foreground">Payment Successful</p>
            <p className="text-xs text-muted-foreground">₹{amount} paid · Redirecting…</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
