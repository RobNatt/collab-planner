import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export function FunnelPaywallModal({ onClose, onContinueFree }) {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const goLtd = () => {
    onClose?.();
    navigate('/ltd');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onContinueFree?.()}
    >
      <div
        className="animate-scaleIn"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '28px 24px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 12px 40px ${colors.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="paywall-title"
          style={{
            color: colors.text,
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '12px',
            lineHeight: 1.25,
          }}
        >
          Ready to stop doing this manually forever?
        </h2>
        <p style={{ color: colors.textSecondary, marginBottom: '16px', lineHeight: 1.55, fontSize: '15px' }}>
          You&apos;ve seen how it works.
          <br /><br />
          Now imagine every trip being this easy:
        </p>
        <ul style={{ margin: '0 0 20px', paddingLeft: '0', listStyle: 'none', color: colors.text, fontSize: '15px', lineHeight: 1.6 }}>
          {['No chasing people', 'No messy expenses', 'No chaos'].map((t) => (
            <li key={t} style={{ marginBottom: '8px', paddingLeft: '4px' }}>• {t}</li>
          ))}
        </ul>
        <div style={{
          padding: '14px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '12px',
          marginBottom: '20px',
        }}
        >
          <p style={{ margin: 0, color: colors.text, fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
            If you take 2–3 trips a year…
          </p>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '14px', lineHeight: 1.55 }}>
            And this saves you just <strong style={{ color: colors.text }}>2 hours per trip</strong> and{' '}
            <strong style={{ color: colors.text }}>one awkward money situation</strong> — that alone is worth more than $49.
          </p>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          marginBottom: '16px',
        }}
        >
          <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px' }}>Lifetime Access</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: colors.primary }}>$49</div>
          <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '8px', lineHeight: 1.45 }}>
            Unlimited trips · Unlimited collaborators · All future features
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={goLtd}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            Unlock Lifetime Access
          </button>
          <button
            type="button"
            onClick={() => { onClose?.(); onContinueFree?.(); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: 'none',
            }}
          >
            Continue with Free Version
          </button>
        </div>
        <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '12px', color: colors.textMuted }}>
          No pressure. Upgrade anytime.
        </p>
      </div>
    </div>
  );
}
