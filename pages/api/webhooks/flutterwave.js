// pages/api/webhooks/flutterwave.js
// The AUTHORITATIVE confirmation, independent of the browser redirect.
// 1) reject any request whose verif-hash header != our dashboard secret hash
// 2) re-verify the transaction server-side
// 3) (DB) mark the booking paid — idempotently
import { webhookSignatureValid, verifyTransaction, expectedAmountFromMeta, paymentIsValid } from '../../../lib/flutterwave.server';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!webhookSignatureValid(req.headers['verif-hash'])) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Acknowledge fast; do the work after. Flutterwave retries on non-200.
  res.status(200).json({ received: true });

  try {
    const event = req.body;
    if (event?.event === 'charge.completed' && event?.data?.status === 'successful') {
      const result = await verifyTransaction(event.data.id);
      const d = result?.data;
      const expected = { amount: expectedAmountFromMeta(d?.meta), currency: d?.currency };
      if (paymentIsValid(d, expected)) {
        // ── DB SWAP-POINT: mark booking d.meta.cona_ref PAID (idempotent). ──
      }
    }
  } catch (e) {
    // already responded 200; log for reconciliation
    console.error('FLW webhook processing error', e);
  }
}
