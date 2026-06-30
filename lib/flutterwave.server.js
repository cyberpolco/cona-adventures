// lib/flutterwave.server.js  — SERVER ONLY (uses the secret key). Never import client-side.
import crypto from 'crypto';
import { estimatePrice, depositOf } from './pricing';

const BASE = process.env.FLW_BASE_URL || 'https://api.flutterwave.com/v3';

export function flwConfigured() {
  return Boolean(process.env.FLW_SECRET_KEY);
}

// Create a Flutterwave Standard hosted-checkout link. Returns the URL to redirect to.
export async function initPayment({ tx_ref, amount, currency, redirect_url, customer, meta }) {
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
export async function verifyTransaction(transactionId) {
  const res = await fetch(`${BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return res.json(); // { status, message, data: { status, amount, currency, tx_ref, meta, ... } }
}

// Recompute, from the selections WE stored in meta, the amount that SHOULD have
// been charged — never trust a number the browser could have touched.
export function expectedAmountFromMeta(meta) {
  try {
    const sel = JSON.parse(meta?.selections || '{}');
    const full = estimatePrice(sel);
    return sel.payType === 'deposit' ? depositOf(full) : full;
  } catch {
    return 0;
  }
}

// Pure integrity gate (unit-testable, no network).
export function paymentIsValid(data, expected) {
  if (!data) return false;
  return (
    data.status === 'successful' &&
    Number(data.amount) >= Number(expected.amount) &&
    Number(expected.amount) > 0 &&
    String(data.currency).toUpperCase() === String(expected.currency).toUpperCase()
  );
}

// Constant-time comparison of the webhook secret hash.
export function webhookSignatureValid(headerHash) {
  const secret = process.env.FLW_WEBHOOK_HASH || '';
  if (!headerHash || !secret) return false;
  const a = Buffer.from(String(headerHash));
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
