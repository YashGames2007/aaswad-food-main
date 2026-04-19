export interface User {
  id: string;
  name: string;
  phone: string;
  defaultLocation: string;
  email?: string;
  address?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'sabji' | 'dal' | 'roti' | 'rice' | 'addon' | 'thali';
  available: boolean;
}

export interface Slot {
  id: string;
  time: string; // "13:00", "13:15"
  label: string; // "1:00 PM"
  capacity: number;
  currentOrders: number;
  cutoffMinutes: number;
}

export type SlotStatus = 'available' | 'few-left' | 'full';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: {
    sabjis: string[];
    rotiCount: number;
    rice: boolean;
    addons: string[];
  };
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  slot: Slot;
  location: string;
  status: OrderStatus;
  paymentType: 'upi' | 'cod';
  totalAmount: number;
  createdAt: string;
  rating?: number;
  feedback?: string;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered';

export interface DailyMenu {
  date: string;
  sabjis: MenuItem[];
  dal: MenuItem;
  rotis: MenuItem;
  rice: MenuItem;
  addons: MenuItem[];
  thalis: MenuItem[];
}

export const LOCATIONS = [
  'College Gate',
  'Hostel A',
  'Hostel B',
  'PG Cluster - North',
  'PG Cluster - South',
] as const;
