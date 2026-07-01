// lib/bookingSession.js — booking flow persistence via localStorage + TTL.
// localStorage survives tab/browser close so returning visitors don't lose their work.
// TTL prevents stale data: trip data expires after 7 days, booking after 24 hours.

const TRIP_KEY    = 'cona_tripData';
const BOOKING_KEY = 'cona_booking';
const TRIP_TTL_MS    = 7  * 24 * 60 * 60 * 1000; // 7 days
const BOOKING_TTL_MS = 24 *      60 * 60 * 1000; // 24 hours

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function safeSet(key, value, ttl) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify({ data: value, expires: Date.now() + ttl }));
}

export const getTripData    = ()      => safeGet(TRIP_KEY);
export const setTripData    = (data)  => safeSet(TRIP_KEY, data, TRIP_TTL_MS);
export const mergeTripData  = (patch) => safeSet(TRIP_KEY, { ...safeGet(TRIP_KEY), ...patch }, TRIP_TTL_MS);

export const getBooking     = ()      => safeGet(BOOKING_KEY);
export const setBooking     = (data)  => safeSet(BOOKING_KEY, data, BOOKING_TTL_MS);
export const mergeBooking   = (patch) => safeSet(BOOKING_KEY, { ...safeGet(BOOKING_KEY), ...patch }, BOOKING_TTL_MS);

export function clearBookingSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRIP_KEY);
  localStorage.removeItem(BOOKING_KEY);
}
