import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const requiredKeys: Array<keyof FirebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const getMissingFirebaseKeys = () => {
  return requiredKeys.filter((key) => !firebaseConfig[key]);
};

const maskValue = (value?: string) => {
  if (!value) return '(missing)';
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

let hasLoggedFirebaseDiagnostics = false;

const logFirebaseDiagnostics = () => {
  if (hasLoggedFirebaseDiagnostics) return;
  hasLoggedFirebaseDiagnostics = true;

  const missingKeys = getMissingFirebaseKeys();
  const hasReactAppFirebaseVars = [
    env.REACT_APP_FIREBASE_API_KEY,
    env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    env.REACT_APP_FIREBASE_PROJECT_ID,
    env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    env.REACT_APP_FIREBASE_APP_ID,
  ].some(Boolean);

  console.info('[Firebase] Vite mode:', env.MODE || '(unknown)');
  console.info('[Firebase] Config snapshot:', {
    apiKey: maskValue(firebaseConfig.apiKey),
    authDomain: firebaseConfig.authDomain || '(missing)',
    projectId: firebaseConfig.projectId || '(missing)',
    storageBucket: firebaseConfig.storageBucket || '(missing)',
    messagingSenderId: maskValue(firebaseConfig.messagingSenderId),
    appId: maskValue(firebaseConfig.appId),
  });

  if (missingKeys.length > 0) {
    console.error('[Firebase] Missing VITE_* keys:', missingKeys);
    console.info('[Firebase] This app uses Vite, so frontend env vars must be prefixed with VITE_.');
    if (hasReactAppFirebaseVars) {
      console.info('[Firebase] REACT_APP_* keys were detected. Rename them to VITE_* for Vite apps.');
    }
    console.info('[Firebase] After updating .env, restart the dev server.');
  }
};

const getFirebaseApp = (): FirebaseApp => {
  logFirebaseDiagnostics();

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
};

export const isFirebaseConfigured = () => getMissingFirebaseKeys().length === 0;

export const getFirebaseDebugStatus = () => ({
  envSource: 'import.meta.env (Vite)',
  expectedPrefix: 'VITE_',
  isConfigured: isFirebaseConfigured(),
  missingKeys: getMissingFirebaseKeys(),
});

export const getFirebaseAuth = (): Auth => {
  logFirebaseDiagnostics();

  const missingKeys = getMissingFirebaseKeys();
  if (missingKeys.length > 0) {
    throw new Error(`Firebase config missing: ${missingKeys.join(', ')}`);
  }

  return getAuth(getFirebaseApp());
};

// Safe accessor for UI checks where we do not want to throw.
export const tryGetFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return getAuth(getFirebaseApp());
};

