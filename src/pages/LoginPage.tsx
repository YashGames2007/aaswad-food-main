import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';
import { motion, useReducedMotion } from 'framer-motion';
import { mapAuthError, sendOtp, verifyOtp } from '@/services/authService';
import { getFirebaseDebugStatus } from '@/lib/firebase';
import logo from '@/assets/logo.png';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const login = useStore((s) => s.login);
  const loginAsAdmin = useStore((s) => s.loginAsAdmin);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const firebaseStatus = getFirebaseDebugStatus();

  useEffect(() => {
    if (!otpSent || timer <= 0) {
      setIsResendEnabled(otpSent && timer <= 0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimer((currentTimer) => {
        if (currentTimer <= 1) {
          window.clearInterval(intervalId);
          setIsResendEnabled(true);
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [otpSent, timer]);

  const startOtpCooldown = () => {
    setTimer(60);
    setIsResendEnabled(false);
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp('');
    setTimer(0);
    setIsResendEnabled(false);
    setConfirmationResult(null);
  };

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await sendOtp(phone, 'recaptcha-container');
      setConfirmationResult(result);
      setOtpSent(true);
      startOtpCooldown();
      setSuccess('OTP sent successfully.');
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a mobile number before resending OTP.');
      return;
    }

    if (!otpSent || !isResendEnabled) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await sendOtp(phone, 'recaptcha-container');
      setConfirmationResult(result);
      setOtp('');
      startOtpCooldown();
      setSuccess('OTP resent successfully.');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!confirmationResult) {
      setError('Please request OTP first.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const credential = await verifyOtp(confirmationResult, otp);
      const authUser = credential.user;

      login({
        id: authUser.uid,
        name: authUser.displayName || 'Student',
        phone: authUser.phoneNumber || `+91${phone.replace(/\D/g, '')}`,
        defaultLocation: 'College Gate',
      });
      setSuccess('Login successful. Redirecting...');
      navigate('/');
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    loginAsAdmin();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-10 pb-8 bg-background">
      <div className="w-full max-w-sm space-y-2">
        <div className="rounded-lg border border-border bg-card px-3 py-2 space-y-1">
          <p className="text-xs font-medium text-foreground">App Loaded</p>
          <p className="text-xs text-muted-foreground">
            Env Source: {firebaseStatus.envSource}
          </p>
          <p className="text-xs text-muted-foreground">
            Expected Prefix: {firebaseStatus.expectedPrefix}
          </p>
          <p className="text-xs text-muted-foreground">
            Firebase Initialized: {firebaseStatus.isConfigured ? 'Yes' : 'No'}
          </p>
          {!firebaseStatus.isConfigured && (
            <p className="text-xs text-destructive">
              Missing: {firebaseStatus.missingKeys.join(', ')}
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="text-center -mb-2">
          <motion.img
            src={logo}
            alt="Aaswad - Ghar ka Swad"
            className="w-80 h-80 sm:w-72 sm:h-72 mx-auto object-contain drop-shadow-md cursor-pointer will-change-transform"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 1,
                    scale: [1, 1.02, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: {
                      duration: 0.6,
                      delay: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      duration: 3.6,
                      delay: 0.4,
                      times: [0, 0.5, 1],
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'loop',
                    },
                  }
            }
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.07,
                    filter: 'drop-shadow(0 12px 24px hsl(var(--primary) / 0.28))',
                    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                  }
            }
          />
        </div>

        <div className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 bg-card focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
                  <span className="text-muted-foreground text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your number"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div id="recaptcha-container" className="h-0 overflow-hidden" />
              </div>
              <motion.button
                onClick={handleSendOtp}
                disabled={phone.replace(/\D/g, '').length < 10 || loading || !firebaseStatus.isConfigured}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                whileHover={
                  !prefersReducedMotion && phone.replace(/\D/g, '').length >= 10 && !loading && firebaseStatus.isConfigured
                    ? { scale: 1.02, filter: 'brightness(1.05)' }
                    : undefined
                }
                whileTap={!prefersReducedMotion ? { scale: 0.97 } : undefined}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send OTP
              </motion.button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground text-center text-xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-primary/30 transition-shadow placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  OTP sent to +91 {phone}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetOtpFlow();
                      setError('');
                      setSuccess('');
                    }}
                    className="text-primary font-medium"
                  >
                    Change
                  </button>
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {isResendEnabled ? 'You can resend OTP now.' : `Resend OTP in ${timer}s`}
                  </p>
                  <motion.button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!isResendEnabled || loading || !phone.trim() || !firebaseStatus.isConfigured}
                    className="text-xs font-semibold text-primary disabled:text-muted-foreground disabled:opacity-60"
                    whileHover={
                      !prefersReducedMotion && isResendEnabled && !loading && phone.replace(/\D/g, '').length >= 10 && firebaseStatus.isConfigured
                        ? { scale: 1.03 }
                        : undefined
                    }
                    whileTap={!prefersReducedMotion ? { scale: 0.97 } : undefined}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {loading ? 'Resending...' : 'Resend OTP'}
                  </motion.button>
                </div>
              </div>
              <motion.button
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                whileHover={
                  !prefersReducedMotion && otp.length === 6 && !loading
                    ? { scale: 1.02, filter: 'brightness(1.05)' }
                    : undefined
                }
                whileTap={!prefersReducedMotion ? { scale: 0.97 } : undefined}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify & Login
              </motion.button>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={handleAdminLogin}
            className="text-xs text-muted-foreground underline"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
