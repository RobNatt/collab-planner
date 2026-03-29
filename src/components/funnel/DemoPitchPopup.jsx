import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export function DemoPitchPopup({ onClose }) {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1800,
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="animate-fadeIn"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '28px 22px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 12px 40px ${colors.shadow}`,
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, fontSize: '21px', fontWeight: '800', marginBottom: '12px', lineHeight: 1.3 }}>
          This is what your trip could look like in 2 minutes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
          <button
            type="button"
            onClick={() => { navigate('/login?signup=true'); onClose?.(); }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            Create My Trip
          </button>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
            }}
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
