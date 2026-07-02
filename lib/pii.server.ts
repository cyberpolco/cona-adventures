// lib/pii.server.ts — SERVER ONLY.
// PII policy: retention rules, minor detection, field-level redaction by role.
import { ROLES, type Role } from './roles';

export const CONSENT_VERSION = 'v1-2026-07';

// Retention periods (days after travel date, or after today if no travel date).
export const RETENTION = {
  STANDARD_DAYS:   365, // 1 year post-travel for adults
  MINOR_DAYS:       90, // 3 months post-travel for minors (stricter)
  PASSPORT_DAYS:    30, // passport storage key purged 30 days post-travel
  CANCELLED_DAYS:   90, // 90 days after cancellation
};

// Returns true if the traveler is under 18 at their travel date.
export function isMinorAtTravel(dobStr: string | null | undefined, travelDateStr: string | null | undefined): boolean {
  if (!dobStr) return false;
  const dob    = new Date(dobStr);
  const travel = travelDateStr ? new Date(travelDateStr) : new Date();
  const ageMs  = travel.getTime() - dob.getTime();
  return ageMs / (365.25 * 24 * 60 * 60 * 1000) < 18;
}

// Returns the Date after which this traveler's PII should be purged.
export function computeRetainUntil(travelDateStr: string | null | undefined, isMinor: boolean): Date {
  const base = travelDateStr ? new Date(travelDateStr) : new Date();
  const days = isMinor ? RETENTION.MINOR_DAYS : RETENTION.STANDARD_DAYS;
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

// Fields always stripped from API responses — passport key must never leak.
const ALWAYS_STRIP = ['passport', 'guardianName', 'guardianConsentAt'];

// Fields available to Ops for visa processing (not available to Guides/Drivers).
const OPS_VISIBLE  = ['dob', 'nationality', 'isMinor'];

export type TravelerLike = Record<string, unknown>;

// Returns a traveler object with sensitive fields redacted by role.
// Super Admin: sees dob/nationality/isMinor; passport reference always hidden.
// Operations Manager: same as Super Admin (needs dob/nationality for visa processing).
// All other roles: dob, nationality, isMinor also stripped.
export function redactTraveler(traveler: TravelerLike | null | undefined, role: Role): TravelerLike | null {
  if (!traveler) return null;

  const canSeeVisa = role === ROLES.ADMIN || role === ROLES.OPS;

  return Object.fromEntries(
    Object.entries(traveler).filter(([k]) => {
      if (ALWAYS_STRIP.includes(k)) return false;
      if (OPS_VISIBLE.includes(k) && !canSeeVisa) return false;
      return true;
    }).map(([k, v]) => {
      // Log redaction for audit trail
      return [k, v];
    })
  );
}
