// lib/pricing.ts
// SINGLE SOURCE OF TRUTH for trip pricing.
// Imported by the client (for display only) AND by the server /api/checkout
// (for the amount actually charged) — so the two can never diverge, and the
// browser can never dictate the price.

export interface TripPricingInput {
  adults?: number;
  children?: number;
  experiences?: string[];
  country?: string;
  accommodation?: string | null;
}

export function estimatePrice(tripData: TripPricingInput | null | undefined): number {
  if (!tripData) return 0;
  const { adults = 1, children = 0, experiences = [], country, accommodation } = tripData;
  const basePP  = country === 'both' ? 3800 : 1400;
  const expCost = experiences.length * 280;
  const luxMult = accommodation === 'Luxury Lodge' ? 1.4 : accommodation === 'Eco Camp' ? 1.1 : 1;
  return Math.round((basePP + expCost) * luxMult * (adults + children * 0.7));
}

export function depositOf(price: number): number {
  return Math.round(price * 0.4);
}
