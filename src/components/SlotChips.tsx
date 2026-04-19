import { useStore } from '@/store/useStore';
import type { Slot, SlotStatus } from '@/types';

const getSlotStatus = (slot: Slot): SlotStatus => {
  if (slot.currentOrders >= slot.capacity) return 'full';
  if (slot.currentOrders >= slot.capacity * 0.7) return 'few-left';
  return 'available';
};

const isSlotPast = (slotTime: string): boolean => {
  const now = new Date();
  const [h, m] = slotTime.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  // Hide slots where cutoff has passed (30 min before)
  slotDate.setMinutes(slotDate.getMinutes() - 30);
  return now > slotDate;
};

const SlotChips = () => {
  const { slots, selectedSlot, setSelectedSlot, emergencyStop } = useStore();

  const visibleSlots = slots.filter((s) => !isSlotPast(s.time));

  if (emergencyStop) {
    return (
      <div className="px-4 py-3 bg-destructive/10 rounded-xl text-center">
        <p className="text-destructive font-medium text-sm">Ordering is currently paused</p>
      </div>
    );
  }

  if (visibleSlots.length === 0) {
    return (
      <div className="px-4 py-3 bg-muted rounded-xl text-center">
        <p className="text-muted-foreground text-sm">No slots available right now</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {visibleSlots.map((slot) => {
        const status = getSlotStatus(slot);
        const isSelected = selectedSlot?.id === slot.id;
        const isFull = status === 'full';

        return (
          <button
            key={slot.id}
            onClick={() => !isFull && setSelectedSlot(isSelected ? null : slot)}
            disabled={isFull}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
              ${isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : isFull
                  ? 'bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed'
                  : 'bg-card text-foreground border-border hover:border-primary/40 active:scale-95'
              }`}
          >
            <span className="block font-semibold">{slot.label}</span>
            <span className={`block text-[10px] mt-0.5 ${
              isSelected ? 'text-primary-foreground/80'
                : status === 'few-left' ? 'text-primary'
                  : isFull ? 'text-muted-foreground' : 'text-success'
            }`}>
              {status === 'available' ? 'Available' : status === 'few-left' ? 'Few left' : 'Full'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SlotChips;
