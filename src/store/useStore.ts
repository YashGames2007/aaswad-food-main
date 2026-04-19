import { create } from 'zustand';
import type { User, CartItem, Slot, Order, DailyMenu, OrderStatus } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  loginAsAdmin: () => void;

  // Cart
  cart: CartItem[];
  selectedSlot: Slot | null;
  selectedLocation: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setSelectedSlot: (slot: Slot | null) => void;
  setSelectedLocation: (location: string) => void;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (paymentType: 'upi' | 'cod') => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  rateOrder: (orderId: string, rating: number, feedback?: string) => void;

  // Menu (admin)
  dailyMenu: DailyMenu;
  slots: Slot[];
  updateMenu: (menu: DailyMenu) => void;
  updateSlots: (slots: Slot[]) => void;
  emergencyStop: boolean;
  toggleEmergencyStop: () => void;
}

const DEFAULT_MENU: DailyMenu = {
  date: new Date().toISOString().split('T')[0],
  sabjis: [
    { id: 's1', name: 'Aloo Gobi', price: 0, category: 'sabji', available: true },
    { id: 's2', name: 'Paneer Masala', price: 0, category: 'sabji', available: true },
    { id: 's3', name: 'Bhindi Fry', price: 0, category: 'sabji', available: true },
    { id: 's4', name: 'Mix Veg', price: 0, category: 'sabji', available: true },
  ],
  dal: { id: 'd1', name: 'Dal Tadka', price: 0, category: 'dal', available: true },
  rotis: { id: 'r1', name: 'Roti', price: 8, category: 'roti', available: true },
  rice: { id: 'ri1', name: 'Steamed Rice', price: 30, category: 'rice', available: true },
  addons: [
    { id: 'a1', name: 'Dahi', price: 15, category: 'addon', available: true },
    { id: 'a2', name: 'Papad', price: 10, category: 'addon', available: true },
    { id: 'a3', name: 'Salad', price: 15, category: 'addon', available: true },
    { id: 'a4', name: 'Pickle', price: 5, category: 'addon', available: true },
  ],
  thalis: [
    { id: 't1', name: 'Regular Thali', price: 70, category: 'thali', available: true },
    { id: 't2', name: 'Special Thali', price: 100, category: 'thali', available: true },
  ],
};

const formatLabel = (h: number, m: number): string => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${m.toString().padStart(2, '0')} ${period}`;
};

const generateSlots = (): Slot[] => {
  // Generate rolling 15-min slots starting ~45 min from now, for the next 3 hours
  const slots: Slot[] = [];
  const now = new Date();
  const start = new Date(now.getTime() + 45 * 60 * 1000);
  // Round up to next 15-minute boundary
  const mins = start.getMinutes();
  const rounded = Math.ceil(mins / 15) * 15;
  start.setMinutes(rounded, 0, 0);

  const demoOrders = [8, 12, 5, 2, 0, 3, 0, 1, 0, 0, 0, 0];

  for (let i = 0; i < 12; i++) {
    const slotTime = new Date(start.getTime() + i * 15 * 60 * 1000);
    const h = slotTime.getHours();
    const m = slotTime.getMinutes();
    slots.push({
      id: `slot-${i}`,
      time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      label: formatLabel(h, m),
      capacity: 15,
      currentOrders: demoOrders[i] ?? 0,
      cutoffMinutes: 30,
    });
  }
  return slots;
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: (user) => set({ user, isAuthenticated: true, isAdmin: false }),
  logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
  loginAsAdmin: () => set({
    user: { id: 'admin', name: 'Admin', phone: '9999999999', defaultLocation: 'College Gate' },
    isAuthenticated: true,
    isAdmin: true,
  }),

  cart: [],
  selectedSlot: null,
  selectedLocation: 'College Gate',
  addToCart: (item) => set((s) => ({ cart: [...s.cart, item] })),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
  updateCartItem: (id, updates) =>
    set((s) => ({
      cart: s.cart.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  clearCart: () => set({ cart: [], selectedSlot: null }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  orders: [],
  activeOrder: null,
  placeOrder: (paymentType) => {
    const state = get();
    if (!state.selectedSlot || state.cart.length === 0) return;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: state.user?.id || '',
      items: [...state.cart],
      slot: state.selectedSlot,
      location: state.selectedLocation,
      status: 'confirmed',
      paymentType,
      totalAmount: state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      createdAt: new Date().toISOString(),
    };
    // Update slot current orders
    const updatedSlots = state.slots.map((s) =>
      s.id === state.selectedSlot?.id ? { ...s, currentOrders: s.currentOrders + 1 } : s
    );
    set({
      orders: [order, ...state.orders],
      activeOrder: order,
      cart: [],
      selectedSlot: null,
      slots: updatedSlots,
    });
  },
  updateOrderStatus: (orderId, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      activeOrder: s.activeOrder?.id === orderId ? { ...s.activeOrder, status } : s.activeOrder,
    })),
  rateOrder: (orderId, rating, feedback) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, rating, feedback } : o)),
    })),

  dailyMenu: DEFAULT_MENU,
  slots: generateSlots(),
  updateMenu: (menu) => set({ dailyMenu: menu }),
  updateSlots: (slots) => set({ slots }),
  emergencyStop: false,
  toggleEmergencyStop: () => set((s) => ({ emergencyStop: !s.emergencyStop })),
}));
