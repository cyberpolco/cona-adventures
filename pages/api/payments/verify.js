// pages/api/payments/verify.js
// Called by the return page. Re-queries Flutterwave for the final status and
// checks the amount against a SERVER recomputation — the redirect URL itself is
// never trusted (Flutterwave's own #1 security warning).
import { verifyTransaction, expectedAmountFromMeta, paymentIsValid } from '../../../lib/flutterwave.server';

export default async function handler(req, res) {
  const { transaction_id } = req.query;
  if (!transaction_id) return res.status(400).json({ ok: false, error: 'Missing transaction_id' });

  try {
    const result = await verifyTransaction(transaction_id);
    const d = result?.data;
    if (!d) return res.status(502).json({ ok: false, error: 'Verification failed' });

    const expected = { amount: expectedAmountFromMeta(d.meta), currency: d.currency };
    if (!paymentIsValid(d, expected)) {
      return res.status(200).json({ ok: false, status: d.status, error: 'Payment could not be verified' });
    }

    // ── DB SWAP-POINT: mark booking (d.meta.cona_ref) as PAID, idempotently. ──
    return res.status(200).json({
      ok: true,
      ref: d.meta?.cona_ref || d.tx_ref,
      amount: d.amount,
      currency: d.currency,
      destination: d.meta?.destination || '',
      leadName: d.meta?.leadName || '',
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Verification error' });
  }
}
