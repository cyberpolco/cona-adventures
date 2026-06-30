// pages/payment/callback.js
// Flutterwave returns the customer here with ?status&tx_ref&transaction_id.
// We confirm the payment via our server (which re-verifies with Flutterwave)
// before showing success — never trust these query params directly.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PaymentCallback() {
  const router = useRouter();
  const [s, setS] = useState({ loading: true });

  useEffect(() => {
    if (!router.isReady) return;
    const { status, transaction_id } = router.query;
    if (status === 'cancelled' || status === 'failed' || !transaction_id) {
      setS({ loading: false, ok: false, msg: 'Your payment was not completed.' });
      return;
    }
    fetch(`/api/payments/verify?transaction_id=${encodeURIComponent(transaction_id)}`)
      .then((r) => r.json())
      .then((d) => setS({ loading: false, ok: d.ok, data: d, msg: d.error }))
      .catch(() => setS({ loading: false, ok: false, msg: 'We could not verify your payment.' }));
  }, [router.isReady, router.query]);

  return (
    <>
      <Head><title>CoNa Adventures — Payment</title></Head>
      <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 460, padding: 24 }}>
          {s.loading && <p style={{ color: 'var(--muted)' }}>Confirming your payment…</p>}

          {!s.loading && s.ok && (
            <>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>✅</div>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--sand)', marginBottom: 8 }}>Booking confirmed</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 6 }}>
                Reference <strong style={{ color: 'var(--gold)' }}>{s.data.ref}</strong>
              </p>
              <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                Paid: {s.data.currency} {Number(s.data.amount).toLocaleString()}
              </p>
              <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
            </>
          )}

          {!s.loading && !s.ok && (
            <>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>⚠️</div>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--sand)', marginBottom: 8 }}>Payment not confirmed</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{s.msg || 'Please try again.'}</p>
              <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
