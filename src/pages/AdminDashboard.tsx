import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Package, Clock, Menu, LogOut } from 'lucide-react';
import type { OrderStatus } from '@/types';

const STATUS_OPTIONS: OrderStatus[] = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];

const AdminDashboard = () => {
  const { orders, slots, dailyMenu, emergencyStop, toggleEmergencyStop, updateOrderStatus, logout } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'slots' | 'menu'>('orders');
  const [filterSlot, setFilterSlot] = useState<string>('all');

  const filteredOrders = filterSlot === 'all' ? orders : orders.filter((o) => o.slot.id === filterSlot);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Stop */}
      <div className="px-4 mb-4">
        <button
          onClick={toggleEmergencyStop}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all
            ${emergencyStop ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}
        >
          <AlertTriangle className="w-5 h-5" />
          {emergencyStop ? 'Resume Orders' : 'Stop All Orders'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mb-4">
        {[
          { key: 'orders' as const, icon: Package, label: 'Orders' },
          { key: 'slots' as const, icon: Clock, label: 'Slots' },
          { key: 'menu' as const, icon: Menu, label: 'Menu' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all
              ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter */}
            <select
              value={filterSlot}
              onChange={(e) => setFilterSlot(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground mb-3 outline-none"
            >
              <option value="all">All Slots</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {filteredOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-card rounded-xl p-3 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{order.id}</p>
                        <p className="text-sm font-medium text-foreground">{order.items.map(i => i.name).join(', ')}</p>
                        <p className="text-xs text-muted-foreground">{order.slot.label} · {order.location}</p>
                      </div>
                      <span className="text-primary font-semibold text-sm">₹{order.totalAmount}</span>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="w-full bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SLOTS TAB */}
        {activeTab === 'slots' && (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {slot.currentOrders}/{slot.capacity} orders
                  </p>
                </div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(slot.currentOrders / slot.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-3">
            <div className="bg-card rounded-xl p-3 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2">Today's Sabjis</h4>
              {dailyMenu.sabjis.map((s) => (
                <p key={s.id} className="text-sm text-foreground/80 py-0.5">• {s.name}</p>
              ))}
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2">Dal</h4>
              <p className="text-sm text-foreground/80">• {dailyMenu.dal.name}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2">Add-ons</h4>
              {dailyMenu.addons.map((a) => (
                <p key={a.id} className="text-sm text-foreground/80 py-0.5">• {a.name} – ₹{a.price}</p>
              ))}
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2">Thalis</h4>
              {dailyMenu.thalis.map((t) => (
                <p key={t.id} className="text-sm text-foreground/80 py-0.5">• {t.name} – ₹{t.price}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
