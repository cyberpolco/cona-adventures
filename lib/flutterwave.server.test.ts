import { describe, it, expect, afterEach } from 'vitest';
import { expectedAmountFromMeta, paymentIsValid, webhookSignatureValid } from './flutterwave.server';

describe('expectedAmountFromMeta', () => {
  it('recomputes the full price from stored selections', () => {
    const meta = { selections: JSON.stringify({ country: 'congo', adults: 1, payType: 'full' }) };
    expect(expectedAmountFromMeta(meta)).toBe(1400);
  });

  it('recomputes the deposit amount when payType is deposit', () => {
    const meta = { selections: JSON.stringify({ country: 'congo', adults: 1, payType: 'deposit' }) };
    expect(expectedAmountFromMeta(meta)).toBe(Math.round(1400 * 0.4));
  });

  it('falls back to the base single-country/1-adult price when selections are missing entirely', () => {
    // Documents current behavior: an empty/absent `selections` parses as `{}`,
    // and estimatePrice({}) still returns the 1-adult single-country base
    // price rather than 0 — it does not require a `country` to be set.
    expect(expectedAmountFromMeta(undefined)).toBe(1400);
    expect(expectedAmountFromMeta({})).toBe(1400);
  });

  it('returns 0 for malformed JSON instead of throwing', () => {
    expect(expectedAmountFromMeta({ selections: '{not json' })).toBe(0);
  });
});

describe('paymentIsValid', () => {
  const expected = { amount: 1400, currency: 'USD' };

  it('is false when the gateway data is missing', () => {
    expect(paymentIsValid(null, expected)).toBe(false);
    expect(paymentIsValid(undefined, expected)).toBe(false);
  });

  it('is true when status/amount/currency all match', () => {
    const data = { id: 1, status: 'successful', amount: 1400, currency: 'USD', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(true);
  });

  it('is true when the gateway amount exceeds the expected amount (overpayment is fine)', () => {
    const data = { id: 1, status: 'successful', amount: 1500, currency: 'USD', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(true);
  });

  it('is false when the gateway amount is short of what was expected', () => {
    const data = { id: 1, status: 'successful', amount: 1000, currency: 'USD', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(false);
  });

  it('is false when the status is not "successful"', () => {
    const data = { id: 1, status: 'pending', amount: 1400, currency: 'USD', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(false);
  });

  it('is false on a currency mismatch, case-insensitively checked', () => {
    const data = { id: 1, status: 'successful', amount: 1400, currency: 'EUR', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(false);
  });

  it('is case-insensitive on a matching currency', () => {
    const data = { id: 1, status: 'successful', amount: 1400, currency: 'usd', tx_ref: 'x' };
    expect(paymentIsValid(data, expected)).toBe(true);
  });

  it('is false when the expected amount is 0 (refuses to validate a free/miscalculated charge)', () => {
    const data = { id: 1, status: 'successful', amount: 0, currency: 'USD', tx_ref: 'x' };
    expect(paymentIsValid(data, { amount: 0, currency: 'USD' })).toBe(false);
  });
});

describe('webhookSignatureValid', () => {
  const ORIGINAL_HASH = process.env.FLW_WEBHOOK_HASH;

  afterEach(() => {
    process.env.FLW_WEBHOOK_HASH = ORIGINAL_HASH;
  });

  it('is false when no secret is configured', () => {
    delete process.env.FLW_WEBHOOK_HASH;
    expect(webhookSignatureValid('anything')).toBe(false);
  });

  it('is false when no header hash is provided', () => {
    process.env.FLW_WEBHOOK_HASH = 'shared-secret';
    expect(webhookSignatureValid(undefined)).toBe(false);
  });

  it('is true when the header hash matches the configured secret', () => {
    process.env.FLW_WEBHOOK_HASH = 'shared-secret';
    expect(webhookSignatureValid('shared-secret')).toBe(true);
  });

  it('is false when the header hash does not match', () => {
    process.env.FLW_WEBHOOK_HASH = 'shared-secret';
    expect(webhookSignatureValid('wrong-secret')).toBe(false);
  });
});
