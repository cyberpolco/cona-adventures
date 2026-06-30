// pages/api/webhooks/flutterwave.js
// Authoritative confirmation, independent of the browser redirect.
// 1) Reject if verif-hash header doesn't match our dashboard secret.
// 2) Re-verify the transaction server-side.
// 3) Mark the booking paid — idempotently.
import { webhookSignatureValid, verifyTransaction, expectedAmountFromMeta, paymentIsValid } from '../../../lib/flutterwave.server';
import { markBookingPaid } from '../../../lib/bookings.server';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!webhookSignatureValid(req.headers['verif-hash'])) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Acknowledge fast; Flutterwave retries on non-200.
  res.status(200).json({ received: true });

  try {
    const event = req.body;
    if (event?.event === 'charge.completed' && event?.data?.status === 'successful') {
      const result = await verifyTransaction(event.data.id);
      const d = result?.data;
      const expected = { amount: expectedAmountFromMeta(d?.meta), currency: d?.currency };
      if (paymentIsValid(d, expected)) {
        await markBookingPaid({
          conaRef:       d.meta?.cona_ref || d.tx_ref,
          txRef:         d.tx_ref,
          transactionId: d.id,
          amount:        d.amount,
          currency:      d.currency,
        });
      }
    }
  } catch (e) {
    console.error('FLW webhook processing error', e);
  }
}
