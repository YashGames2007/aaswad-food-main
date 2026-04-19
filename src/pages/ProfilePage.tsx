import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, MapPin, Phone, User, Star, Mail, Home, Pencil, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LOCATIONS } from '@/types';
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from '@/services/userService';

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: 'Name is required' })
    .max(80, { message: 'Name must be under 80 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Enter a valid email' })
    .max(255, { message: 'Email is too long' }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, { message: 'Phone must be 10 digits' }),
  address: z
    .string()
    .trim()
    .max(200, { message: 'Address must be under 200 characters' })
    .optional()
    .or(z.literal('')),
  defaultLocation: z.string().trim().nonempty({ message: 'Location is required' }),
});

type FormData = z.infer<typeof profileSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  defaultLocation: 'College Gate',
};

const ProfilePage = () => {
  const { user, orders, logout, login } = useStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const res = await getUserProfile(user);
      if (!mounted) return;
      if (res.success && res.data) {
        setProfile(res.data);
        setForm({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address ?? '',
          defaultLocation: res.data.defaultLocation,
        });
      } else {
        toast.error(res.error || 'Failed to load profile');
      }
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const initialForm: FormData | null = useMemo(() => {
    if (!profile) return null;
    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address ?? '',
      defaultLocation: profile.defaultLocation,
    };
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return (Object.keys(form) as (keyof FormData)[]).some(
      (k) => (form[k] ?? '') !== (initialForm[k] ?? '')
    );
  }, [form, initialForm]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (initialForm) setForm(initialForm);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Please fix the errors below');
      return;
    }

    if (!profile) return;
    setIsSaving(true);
    const res = await updateUserProfile({ id: profile.id, ...parsed.data });
    setIsSaving(false);

    if (res.success && res.data) {
      setProfile(res.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Sync with global store so other screens reflect changes
      login({
        id: res.data.id,
        name: res.data.name,
        phone: res.data.phone,
        defaultLocation: res.data.defaultLocation,
        email: res.data.email,
        address: res.data.address,
      });
    } else {
      toast.error(res.error || 'Failed to save profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {isLoading ? 'Loading…' : profile?.name || 'Student'}
                </p>
                <p className="text-xs text-muted-foreground">Personal details</p>
              </div>
            </div>
            {!isEditing && !isLoading && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium active:scale-95 transition-transform"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isEditing ? (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) =>
                    handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="10-digit number"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={form.address ?? ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Hostel block, room no."
                  maxLength={200}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Default Delivery Location</Label>
                <select
                  id="location"
                  value={form.defaultLocation}
                  onChange={(e) => handleChange('defaultLocation', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.defaultLocation && (
                  <p className="text-xs text-destructive">{errors.defaultLocation}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <Row icon={<Mail className="w-4 h-4" />} label="Email" value={profile?.email || '—'} />
              <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={profile?.phone ? `+91 ${profile.phone}` : '—'} />
              <Row icon={<Home className="w-4 h-4" />} label="Address" value={profile?.address || '—'} />
              <Row icon={<MapPin className="w-4 h-4" />} label="Default Location" value={profile?.defaultLocation || '—'} />
            </div>
          )}
        </div>

        {/* Past Orders */}
        <h3 className="font-bold text-foreground pt-2">Past Orders</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.slot.label} · {order.location}
                    </p>
                  </div>
                  <span className="text-primary font-semibold text-sm">₹{order.totalAmount}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'delivered'
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {order.status.replace(/-/g, ' ')}
                  </span>
                  {order.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      {order.rating}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-6"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-1.5 border-t border-border first:border-t-0">
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
