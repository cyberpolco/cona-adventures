'use client';
// SECURE checkout: no card fields collected here. Browser sends trip selections to
// /api/checkout; server recomputes amount; redirects to Flutterwave hosted page.
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getTripData, getBooking, mergeBooking } from '../../lib/bookingSession';

const METHODS = ['💳 Card', '🏦 Bank Transfer', '📱 Mobile Money'];

export default function PaymentPage() {
  const { t, showToast, lang } = useApp();
  const router = useRouter();

  const [tripData, setTripData] = useState(null);
  const [booking,  setLocalBooking] = useState(null);
  const [payType, setPayType] = useState('full');
  const [method, setMethod]   = useState(null);
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    setTripData(getTripData());
    setLocalBooking(getBooking());
  }, []);

  const price   = booking?.price ?? 0;
  const deposit = Math.round(price * 0.4);
  const balance = price - deposit;

  async function handleConfirm() {
    if (!method) { showToast('Please select a payment method.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData, payType, method }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) { showToast(data.error || 'Could not start checkout.'); setBusy(false); return; }

      if (data.url) { window.location.href = data.url; return; }

      // Dev fallback (no FLW keys configured): mock success flow.
      const firstTraveler = tripData?.travelers?.[0];
      const email = firstTraveler?.email || 'your@email.com';
      const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = handle + '_' + Math.floor(100 + Math.random() * 900);

      mergeBooking({ ref: data.ref, price: data.price, email, username, payType, dueNow: data.dueNow });
      router.push(`/${lang}/plan/success`);
    } catch {
      showToast('Network error — please try again.');
    }
    setBusy(false);
  }

  return (
    <div className="page-shell">
      <div className="pay-wrap">
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--sand)', marginBottom: 6 }}>
          {t('payTitle')}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 24 }}>{t('paySubtitle')}</p>

        {/* Pay full */}
        <div
          className={`pay-option${payType === 'full' ? ' selected' : ''}`}
          onClick={() => setPayType('full')}
          role="radio" aria-checked={payType === 'full'} tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPayType('full')}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t('payFull')}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{t('payFullDesc')}</div>
          {payType === 'full' && (
            <div className="pay-breakdown">
              <div className="pay-row"><span>{t('tourPkg')}</span><span>${price.toLocaleString()}</span></div>
              <div className="pay-row"><span>{t('dueNow')}</span><span>${price.toLocaleString()}</span></div>
            </div>
          )}
        </div>

        {/* Deposit */}
        <div
          className={`pay-option${payType === 'deposit' ? ' selected' : ''}`}
          onClick={() => setPayType('deposit')}
          role="radio" aria-checked={payType === 'deposit'} tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPayType('deposit')}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t('payDeposit')}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{t('payDepositDesc')}</div>
          {payType === 'deposit' && (
            <div className="pay-breakdown">
              <div className="pay-row"><span>{t('totalPrice')}</span><span>${price.toLocaleString()}</span></div>
              <div className="pay-row"><span>{t('depositAmt')}</span><span>${deposit.toLocaleString()}</span></div>
              <div className="pay-row"><span>{t('balanceDue')}</span><span>${balance.toLocaleString()}</span></div>
              <div className="pay-row"><span>{t('dueNow')}</span><span>${deposit.toLocaleString()}</span></div>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div style={{ marginTop: 24 }}>
          <label className="form-label">{t('methodLabel')}</label>
          <div className="method-grid">
            {METHODS.map((m) => (
              <div
                key={m}
                className={`method-btn${method === m ? ' selected' : ''}`}
                onClick={() => setMethod(m)}
                role="radio" aria-checked={method === m} tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMethod(m)}
              >
                {m}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'rgba(46,138,138,0.08)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 14px', marginTop: 6, fontSize: '0.8rem', color: 'var(--muted)',
            }}
          >
            <span aria-hidden="true">🔒</span>
            <span>You'll enter card or mobile-money details on our payment provider's secure page. CoNa never stores your card number.</span>
          </div>
        </div>

        <div className="step-nav">
          <button className="btn-back" onClick={() => router.push(`/${lang}/plan/itinerary`)} disabled={busy}>{t('back')}</button>
          <button className="btn-next" onClick={handleConfirm} disabled={busy}>
            {busy ? '…' : t('confirmBook')}
          </button>
        </div>
      </div>
    </div>
  );
}
