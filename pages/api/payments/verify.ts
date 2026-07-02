// pages/api/payments/verify.ts
// Called by the return page. Re-queries Flutterwave for the final status and
// checks the amount against a SERVER recomputation — redirect params are never trusted.
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyTransaction, expectedAmountFromMeta, paymentIsValid } from '../../../lib/flutterwave.server';
import { markBookingPaid } from '../../../lib/bookings.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const transaction_id = Array.isArray(req.query.transaction_id) ? req.query.transaction_id[0] : req.query.transaction_id;
  if (!transaction_id) return res.status(400).json({ ok: false, error: 'Missing transaction_id' });

  try {
    const result = await verifyTransaction(transaction_id);
    const d = result?.data;
    if (!d) return res.status(502).json({ ok: false, error: 'Verification failed' });

    const expected = { amount: expectedAmountFromMeta(d.meta), currency: d.currency };
    if (!paymentIsValid(d, expected)) {
      return res.status(200).json({ ok: false, status: d.status, error: 'Payment could not be verified' });
    }

    await markBookingPaid({
      conaRef:       d.meta?.cona_ref || d.tx_ref,
      txRef:         d.tx_ref,
      transactionId: d.id,
      amount:        d.amount,
      currency:      d.currency,
    });

    return res.status(200).json({
      ok:          true,
      ref:         d.meta?.cona_ref || d.tx_ref,
      amount:      d.amount,
      currency:    d.currency,
      destination: d.meta?.destination || '',
      leadName:    d.meta?.leadName   || '',
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Verification error' });
  }
}
