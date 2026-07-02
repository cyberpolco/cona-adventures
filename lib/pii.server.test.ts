import { describe, it, expect } from 'vitest';
import { isMinorAtTravel, computeRetainUntil, redactTraveler, RETENTION } from './pii.server';
import { ROLES } from './roles';

describe('isMinorAtTravel', () => {
  it('is false when dob is missing', () => {
    expect(isMinorAtTravel(null, '2026-01-01')).toBe(false);
    expect(isMinorAtTravel(undefined, '2026-01-01')).toBe(false);
  });

  it('is true for a traveler under 18 at the travel date', () => {
    expect(isMinorAtTravel('2015-06-01', '2026-01-01')).toBe(true); // ~10.5 years old
  });

  it('is false for a traveler over 18 at the travel date', () => {
    expect(isMinorAtTravel('2000-01-01', '2026-01-01')).toBe(false); // ~26 years old
  });

  it('falls back to today when no travel date is given', () => {
    const almostAdultDob = new Date();
    almostAdultDob.setFullYear(almostAdultDob.getFullYear() - 17);
    expect(isMinorAtTravel(almostAdultDob.toISOString(), null)).toBe(true);
  });
});

describe('computeRetainUntil', () => {
  it('adds the standard retention period for adults', () => {
    const result = computeRetainUntil('2026-01-01', false);
    const expected = new Date('2026-01-01').getTime() + RETENTION.STANDARD_DAYS * 24 * 60 * 60 * 1000;
    expect(result.getTime()).toBe(expected);
  });

  it('adds the shorter retention period for minors', () => {
    const result = computeRetainUntil('2026-01-01', true);
    const expected = new Date('2026-01-01').getTime() + RETENTION.MINOR_DAYS * 24 * 60 * 60 * 1000;
    expect(result.getTime()).toBe(expected);
    expect(result.getTime()).toBeLessThan(computeRetainUntil('2026-01-01', false).getTime());
  });
});

describe('redactTraveler', () => {
  const traveler = {
    firstName: 'Jane',
    lastName: 'Doe',
    dob: '1990-01-01',
    nationality: 'British',
    isMinor: false,
    passport: 'enc:abc123',
    guardianName: 'John Doe',
    guardianConsentAt: '2026-01-01',
  };

  it('returns null for a null traveler', () => {
    expect(redactTraveler(null, ROLES.ADMIN)).toBeNull();
  });

  it('always strips passport/guardian fields, even for Super Admin', () => {
    const redacted = redactTraveler(traveler, ROLES.ADMIN);
    expect(redacted).not.toHaveProperty('passport');
    expect(redacted).not.toHaveProperty('guardianName');
    expect(redacted).not.toHaveProperty('guardianConsentAt');
  });

  it('lets Super Admin and Operations Manager see dob/nationality/isMinor', () => {
    for (const role of [ROLES.ADMIN, ROLES.OPS]) {
      const redacted = redactTraveler(traveler, role);
      expect(redacted).toMatchObject({ dob: '1990-01-01', nationality: 'British', isMinor: false });
    }
  });

  it('strips dob/nationality/isMinor for Guides and Drivers', () => {
    for (const role of [ROLES.GUIDE, ROLES.DRIVER]) {
      const redacted = redactTraveler(traveler, role);
      expect(redacted).not.toHaveProperty('dob');
      expect(redacted).not.toHaveProperty('nationality');
      expect(redacted).not.toHaveProperty('isMinor');
    }
  });

  it('always keeps non-sensitive fields', () => {
    const redacted = redactTraveler(traveler, ROLES.GUIDE);
    expect(redacted).toMatchObject({ firstName: 'Jane', lastName: 'Doe' });
  });
});
