/**
 * Centralized reservation status categorization helper.
 * Standardizes multiple legacy or case variations:
 * 'Confirmed', 'CONFIRMED', 'Provisional', 'PROVISIONAL' -> ACTIVE_UNCONFIRMED / ACTIVE_CONFIRMED
 * 'IN_HOUSE', 'In-House', 'Inhouse', 'Checked-In' -> IN_HOUSE
 * 'Checked-Out', 'CHECKED_OUT', 'Checkout', 'Checked Out' -> CHECKED_OUT
 * 'Cancelled', 'CANCELLED', 'Canceled' -> CANCELLED
 * 'No-Show', 'NO_SHOW' -> NO_SHOW
 */

export const RESERVATION_STATUS = {
  IN_HOUSE: 'IN_HOUSE',
  CHECKED_OUT: 'CHECKED_OUT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  UNKNOWN: 'UNKNOWN',
};

export function normalizeReservationStatus(rawStatus?: string | null): string {
  if (!rawStatus) return RESERVATION_STATUS.UNKNOWN;
  const s = rawStatus.trim().toUpperCase().replace(/[-_\s]+/g, '_');

  if (s === 'IN_HOUSE' || s === 'CHECKED_IN' || s === 'INHOUSE') {
    return RESERVATION_STATUS.IN_HOUSE;
  }
  if (s === 'CHECKED_OUT' || s === 'CHECKOUT') {
    return RESERVATION_STATUS.CHECKED_OUT;
  }
  if (s === 'CONFIRMED' || s === 'PROVISIONAL' || s === 'BOOKED' || s === 'GUARANTEED') {
    return RESERVATION_STATUS.CONFIRMED;
  }
  if (s === 'CANCELLED' || s === 'CANCELED') {
    return RESERVATION_STATUS.CANCELLED;
  }
  if (s === 'NO_SHOW' || s === 'NOSHOW') {
    return RESERVATION_STATUS.NO_SHOW;
  }
  return s;
}

export function isCheckedIn(rawStatus?: string | null): boolean {
  const norm = normalizeReservationStatus(rawStatus);
  return norm === RESERVATION_STATUS.IN_HOUSE || norm === RESERVATION_STATUS.CHECKED_OUT;
}

export function isCheckedOut(rawStatus?: string | null): boolean {
  return normalizeReservationStatus(rawStatus) === RESERVATION_STATUS.CHECKED_OUT;
}

export function isCancelledOrNoShow(rawStatus?: string | null): boolean {
  const norm = normalizeReservationStatus(rawStatus);
  return norm === RESERVATION_STATUS.CANCELLED || norm === RESERVATION_STATUS.NO_SHOW;
}

export function isMaintenanceRoomStatus(statusName?: string | null, statusCode?: string | null): boolean {
  const s = `${statusName || ''} ${statusCode || ''}`.trim().toLowerCase();
  return (
    s.includes('maint') ||
    s.includes('order') ||
    s.includes('service') ||
    s.includes('ooo') ||
    s.includes('oos') ||
    s.includes('vm') ||
    s.includes('om')
  );
}

export function isRoomClean(statusName?: string | null, statusCode?: string | null): boolean {
  const s = `${statusName || ''} ${statusCode || ''}`.trim().toLowerCase();
  if (isMaintenanceRoomStatus(statusName, statusCode)) return false;
  return s.includes('clean') || s.includes('ready') || s.includes('cln') || s.includes('ins') || s.includes('vr') || s.includes('rr') || s.includes('vc');
}
