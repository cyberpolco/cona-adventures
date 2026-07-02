// lib/flutterwave.server.ts — SERVER ONLY (uses the secret key). Never import client-side.
import crypto from 'crypto';
import { estimatePrice, depositOf, type TripPricingInput } from './pricing';

const BASE = process.env.FLW_BASE_URL || 'https://api.flutterwave.com/v3';

export interface FlutterwaveCustomer {
  email: string;
  name: string;
  phonenumber: string;
}

export interface FlutterwaveMeta {
  cona_ref?: string;
  destination?: string;
  leadName?: string;
  selections?: string; // JSON-stringified TripPricingInput + payType
}

export interface InitPaymentParams {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: FlutterwaveCustomer;
  meta: FlutterwaveMeta;
}

export interface FlutterwaveTransactionData {
  id: string | number;
  status: string;
  amount: number;
  currency: string;
  tx_ref: string;
  meta?: FlutterwaveMeta;
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message?: string;
  data?: FlutterwaveTransactionData;
}

export function flwConfigured(): boolean {
  return Boolean(process.env.FLW_SECRET_KEY);
}

// Create a Flutterwave Standard hosted-checkout link. Returns the URL to redirect to.
export async function initPayment({ tx_ref, amount, currency, redirect_url, customer, meta }: InitPaymentParams): Promise<string> {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref,
      amount,
      currency,
      redirect_url,
      customer,
      meta,
      payment_options: 'card,mobilemoney,ussd,banktransfer',
      customizations: { title: 'CoNa Adventures', description: 'Expedition booking' },
    }),
  });
  const json = await res.json();
  if (json?.status !== 'success' || !json?.data?.link) {
    throw new Error(json?.message || 'Flutterwave init failed');
  }
  return json.data.link;
}

// Server-side verification (uses the secret key). transactionId comes from the
// redirect/webhook; we re-query Flutterwave for the authoritative final state.
export async function verifyTransaction(transactionId: string | number): Promise<FlutterwaveVerifyResponse> {
  const res = await fetch(`${BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return res.json(); // { status, message, data: { status, amount, currency, tx_ref, meta, ... } }
}

// Recompute, from the selections WE stored in meta, the amount that SHOULD have
// been charged — never trust a number the browser could have touched.
export function expectedAmountFromMeta(meta: FlutterwaveMeta | undefined): number {
  try {
    const sel: TripPricingInput & { payType?: string } = JSON.parse(meta?.selections || '{}');
    const full = estimatePrice(sel);
    return sel.payType === 'deposit' ? depositOf(full) : full;
  } catch {
    return 0;
  }
}

export interface ExpectedPayment {
  amount: number;
  currency: string | undefined;
}

// Pure integrity gate (unit-testable, no network).
export function paymentIsValid(data: FlutterwaveTransactionData | null | undefined, expected: ExpectedPayment): boolean {
  if (!data) return false;
  return (
    data.status === 'successful' &&
    Number(data.amount) >= Number(expected.amount) &&
    Number(expected.amount) > 0 &&
    String(data.currency).toUpperCase() === String(expected.currency).toUpperCase()
  );
}

// Constant-time comparison of the webhook secret hash.
export function webhookSignatureValid(headerHash: string | string[] | undefined): boolean {
  const secret = process.env.FLW_WEBHOOK_HASH || '';
  if (!headerHash || !secret) return false;
  const a = Buffer.from(String(headerHash));
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
