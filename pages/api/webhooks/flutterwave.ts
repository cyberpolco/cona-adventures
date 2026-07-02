// pages/api/webhooks/flutterwave.ts
// Authoritative confirmation, independent of the browser redirect.
// 1) Reject if verif-hash header doesn't match our dashboard secret.
// 2) Re-verify the transaction server-side.
// 3) Mark the booking paid — idempotently.
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  webhookSignatureValid,
  verifyTransaction,
  expectedAmountFromMeta,
  paymentIsValid,
  type FlutterwaveTransactionData,
} from '../../../lib/flutterwave.server';
import { markBookingPaid } from '../../../lib/bookings.server';

interface FlutterwaveWebhookEvent {
  event?: string;
  data?: FlutterwaveTransactionData;
}

interface WebhookApiRequest extends NextApiRequest {
  body: FlutterwaveWebhookEvent;
}

export default async function handler(req: WebhookApiRequest, res: NextApiResponse) {
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
      if (!d) return;
      const expected = { amount: expectedAmountFromMeta(d.meta), currency: d.currency };
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
