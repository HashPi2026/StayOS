export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export const ROOM_STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  clean: { label: 'Clean', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  dirty: { label: 'Dirty', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  occupied: { label: 'Occupied', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  available: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  maintenance: { label: 'Maintenance', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ooo: { label: 'Out of Order', bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' },
};

export const BUILDING_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  inactive: { bg: 'bg-stone-100', text: 'text-stone-700' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700' },
  closed: { bg: 'bg-rose-50', text: 'text-rose-700' },
};
