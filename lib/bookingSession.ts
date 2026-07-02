// lib/bookingSession.ts — booking flow persistence via localStorage + TTL.
// localStorage survives tab/browser close so returning visitors don't lose their work.
// TTL prevents stale data: trip data expires after 7 days, booking after 24 hours.

const TRIP_KEY    = 'cona_tripData';
const BOOKING_KEY = 'cona_booking';
const TRIP_TTL_MS    = 7  * 24 * 60 * 60 * 1000; // 7 days
const BOOKING_TTL_MS = 24 *      60 * 60 * 1000; // 24 hours

function safeGet<T = Record<string, unknown>>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; }
}

function safeSet(key: string, value: unknown, ttl: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify({ data: value, expires: Date.now() + ttl }));
}

export const getTripData    = <T = Record<string, unknown>>(): T | null => safeGet<T>(TRIP_KEY);
export const setTripData    = (data: unknown): void  => safeSet(TRIP_KEY, data, TRIP_TTL_MS);
export const mergeTripData  = (patch: Record<string, unknown>): void => safeSet(TRIP_KEY, { ...(safeGet<Record<string, unknown>>(TRIP_KEY) ?? {}), ...patch }, TRIP_TTL_MS);

export const getBooking     = <T = Record<string, unknown>>(): T | null => safeGet<T>(BOOKING_KEY);
export const setBooking     = (data: unknown): void => safeSet(BOOKING_KEY, data, BOOKING_TTL_MS);
export const mergeBooking   = (patch: Record<string, unknown>): void => safeSet(BOOKING_KEY, { ...(safeGet<Record<string, unknown>>(BOOKING_KEY) ?? {}), ...patch }, BOOKING_TTL_MS);

export function clearBookingSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRIP_KEY);
  localStorage.removeItem(BOOKING_KEY);
}
