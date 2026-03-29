import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

export function EmailCaptureModal({ onClose }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email.');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'demoLeads'), {
        email: trimmed,
        source: 'demo_funnel',
        createdAt: serverTimestamp(),
      });
      toast.success('You\'re on the list. Check your inbox soon.');
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.success('Thanks — we\'ll follow up at that address.');
      onClose?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-cap-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1900,
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="animate-scaleIn"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '26px 22px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 12px 40px ${colors.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="email-cap-title" style={{ color: colors.text, fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
          Want to save your trip or create your own?
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.55, marginBottom: '18px' }}>
          Drop your email and pick up where you left off anytime.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.inputBg,
              color: colors.text,
              marginBottom: '14px',
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? 'Saving…' : 'Save My Trip'}
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            fontSize: '14px',
            color: colors.textMuted,
            background: 'none',
            border: 'none',
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
