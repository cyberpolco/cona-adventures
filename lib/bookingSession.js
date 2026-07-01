// lib/bookingSession.js — thin sessionStorage helpers for the booking flow.
// sessionStorage persists across route changes within a tab and clears on close.

const TRIP_KEY    = 'cona_tripData';
const BOOKING_KEY = 'cona_booking';

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}
function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export const getTripData    = ()      => safeGet(TRIP_KEY);
export const setTripData    = (data)  => safeSet(TRIP_KEY, data);
export const mergeTripData  = (patch) => safeSet(TRIP_KEY, { ...safeGet(TRIP_KEY), ...patch });

export const getBooking     = ()      => safeGet(BOOKING_KEY);
export const setBooking     = (data)  => safeSet(BOOKING_KEY, data);
export const mergeBooking   = (patch) => safeSet(BOOKING_KEY, { ...safeGet(BOOKING_KEY), ...patch });

export function clearBookingSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TRIP_KEY);
  sessionStorage.removeItem(BOOKING_KEY);
}
