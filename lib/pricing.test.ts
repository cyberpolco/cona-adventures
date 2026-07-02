import { describe, it, expect } from 'vitest';
import { estimatePrice, depositOf } from './pricing';

describe('estimatePrice', () => {
  it('returns 0 for missing trip data', () => {
    expect(estimatePrice(null)).toBe(0);
    expect(estimatePrice(undefined)).toBe(0);
  });

  it('uses the single-country base price for one adult, no experiences', () => {
    expect(estimatePrice({ country: 'congo', adults: 1 })).toBe(1400);
    expect(estimatePrice({ country: 'namibia', adults: 1 })).toBe(1400);
  });

  it('uses the higher base price for "both" countries', () => {
    expect(estimatePrice({ country: 'both', adults: 1 })).toBe(3800);
  });

  it('adds $280 per selected experience', () => {
    expect(estimatePrice({ country: 'congo', adults: 1, experiences: ['a', 'b'] })).toBe(1400 + 560);
  });

  it('applies the Luxury Lodge multiplier', () => {
    expect(estimatePrice({ country: 'congo', adults: 1, accommodation: 'Luxury Lodge' })).toBe(Math.round(1400 * 1.4));
  });

  it('applies the Eco Camp multiplier', () => {
    expect(estimatePrice({ country: 'congo', adults: 1, accommodation: 'Eco Camp' })).toBe(Math.round(1400 * 1.1));
  });

  it('applies no multiplier for an unrecognized/absent accommodation', () => {
    expect(estimatePrice({ country: 'congo', adults: 1, accommodation: 'Budget Guesthouse' })).toBe(1400);
  });

  it('charges children at 0.7x an adult', () => {
    const oneAdult = estimatePrice({ country: 'congo', adults: 1 });
    const oneAdultOneChild = estimatePrice({ country: 'congo', adults: 1, children: 1 });
    expect(oneAdultOneChild).toBe(Math.round(1400 * 1.7));
    expect(oneAdultOneChild).toBeGreaterThan(oneAdult);
  });

  it('defaults to 1 adult when adults is omitted', () => {
    expect(estimatePrice({ country: 'congo' })).toBe(estimatePrice({ country: 'congo', adults: 1 }));
  });
});

describe('depositOf', () => {
  it('is 40% of the total price, rounded', () => {
    expect(depositOf(1000)).toBe(400);
    expect(depositOf(1)).toBe(0); // rounds down from 0.4
    expect(depositOf(5)).toBe(2); // rounds from 2.0
  });
});
