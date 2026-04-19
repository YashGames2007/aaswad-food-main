import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;

const toE164 = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phoneNumber.startsWith('+') && digits.length >= 10) {
    return phoneNumber;
  }
  throw new Error('Please enter a valid mobile number.');
};

export const setupRecaptcha = (containerId: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Phone authentication is only available in browser environments.');
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('Recaptcha container is missing in the DOM.');
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
      size: 'invisible',
      callback: () => {
        // Recaptcha solved automatically for invisible mode.
      },
    });
  }

  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber: string, containerId: string): Promise<ConfirmationResult> => {
  const verifier = setupRecaptcha(containerId);
  const normalizedPhone = toE164(phoneNumber);

  try {
    return await signInWithPhoneNumber(getFirebaseAuth(), normalizedPhone, verifier);
  } catch (error) {
    console.error('OTP send failed:', error);
    recaptchaVerifier?.clear();
    recaptchaVerifier = null;
    throw error;
  }
};

export const verifyOtp = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> => {
  if (!confirmationResult) {
    throw new Error('OTP confirmation is not available. Please request OTP again.');
  }

  return confirmationResult.confirm(code);
};

export const mapAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code;

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The phone number format is invalid.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Please check and try again.';
    case 'auth/code-expired':
      return 'OTP has expired. Please request a new one.';
    case 'auth/missing-verification-code':
      return 'Please enter the OTP.';
    default:
      return 'Something went wrong. Please try again.';
  }
};
