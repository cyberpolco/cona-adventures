// components/pages/PaymentPage.js
import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const METHODS = ['💳 Credit Card', '🏦 Bank Transfer', '📱 Mobile Money'];

export default function PaymentPage() {
  const { t, booking, showPage, setBooking, showToast, tripData } = useApp();

  const [payType, setPayType] = useState('full');  // full | deposit
  const [method, setMethod]   = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum]   = useState('');
  const [expCvv, setExpCvv]     = useState('');

  const price    = booking?.price ?? 0;
  const deposit  = Math.round(price * 0.4);
  const dueNow   = payType === 'full' ? price : deposit;
  const balance  = price - deposit;

  function handleConfirm() {
    if (!method) { showToast('Please select a payment method.'); return; }
    if (!cardName || !cardNum) { showToast('Please fill in payment details.'); return; }

    const ref = 'CNA-' + Math.floor(8000 + Math.random() * 1999);
    const firstTraveler = tripData?.travelers?.[0];
    const email = firstTraveler?.email || 'your@email.com';
    const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = handle + '_' + Math.floor(100 + Math.random() * 900);

    setBooking((b) => ({ ...b, ref, email, username, payType, dueNow }));
    showPage('success');
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
          role="radio"
          aria-checked={payType === 'full'}
          tabIndex={0}
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
          role="radio"
          aria-checked={payType === 'deposit'}
          tabIndex={0}
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
                role="radio"
                aria-checked={method === m}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMethod(m)}
              >
                {m}
              </div>
            ))}
          </div>

          <label className="form-label">{t('cardName')}</label>
          <input type="text" placeholder="Full Name" value={cardName} onChange={(e) => setCardName(e.target.value)} style={{ marginBottom: 10 }} />

          <label className="form-label">{t('cardNum')}</label>
          <input type="text" placeholder="•••• •••• •••• ••••" value={cardNum} onChange={(e) => setCardNum(e.target.value)} style={{ marginBottom: 10 }} />

          <label className="form-label">{t('expCvv')}</label>
          <input type="text" placeholder="MM/YY · CVV" value={expCvv} onChange={(e) => setExpCvv(e.target.value)} style={{ marginBottom: 20 }} />
        </div>

        <div className="step-nav">
          <button className="btn-back" onClick={() => showPage('itinerary')}>{t('back')}</button>
          <button className="btn-next" onClick={handleConfirm}>{t('confirmBook')}</button>
        </div>
      </div>
    </div>
  );
}
