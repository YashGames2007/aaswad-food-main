import type { User } from '@/types';

/**
 * User service layer.
 *
 * Currently uses a mock in-memory store with simulated network latency.
 * To plug in a real backend later, replace the bodies of `getUserProfile`
 * and `updateUserProfile` with `fetch(...)` / axios calls — the function
 * signatures and return shapes should remain the same.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  defaultLocation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const STORAGE_KEY = 'aaswad:user-profile';
const SIMULATED_LATENCY_MS = 600;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const readMockStore = (fallback: User | null): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    // ignore
  }
  if (!fallback) return null;
  return {
    id: fallback.id,
    name: fallback.name,
    email: fallback.email ?? '',
    phone: fallback.phone,
    address: fallback.address ?? '',
    defaultLocation: fallback.defaultLocation,
  };
};

const writeMockStore = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
};

/**
 * Fetch the current user's profile.
 *
 * Replace with: `await fetch('/api/users/me').then(r => r.json())`
 */
export async function getUserProfile(
  fallback: User | null
): Promise<ApiResponse<UserProfile>> {
  await wait(SIMULATED_LATENCY_MS);
  const profile = readMockStore(fallback);
  if (!profile) {
    return { success: false, error: 'No user found' };
  }
  return { success: true, data: profile };
}

/**
 * Update the user's profile.
 *
 * Replace with: `await fetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) })`
 */
export async function updateUserProfile(
  data: Partial<UserProfile> & { id: string }
): Promise<ApiResponse<UserProfile>> {
  await wait(SIMULATED_LATENCY_MS);

  // Simulate occasional server error (uncomment to test):
  // if (Math.random() < 0.1) return { success: false, error: 'Server error' };

  const existing = readMockStore(null);
  const merged: UserProfile = {
    id: data.id,
    name: data.name ?? existing?.name ?? '',
    email: data.email ?? existing?.email ?? '',
    phone: data.phone ?? existing?.phone ?? '',
    address: data.address ?? existing?.address ?? '',
    defaultLocation: data.defaultLocation ?? existing?.defaultLocation ?? 'College Gate',
  };
  writeMockStore(merged);
  return { success: true, data: merged };
}
