// Shapes sent from the browser (trip planner) to /api/checkout.
// Distinct from the Prisma Booking/Traveler models — this is the pre-persistence,
// user-supplied input shape.

export interface TravelerInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date string
  nationality?: string;
}

export interface TripSelection {
  consent: boolean;
  country?: string;
  adults?: number;
  children?: number;
  experiences?: string[];
  accommodation?: string | null;
  arrival?: string; // ISO date string
  departure?: string; // ISO date string
  travelers?: TravelerInput[];
}

export type PayType = 'full' | 'deposit';
