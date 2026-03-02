import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';

export function UpgradeModal({ onClose }) {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [spotsRemaining, setSpotsRemaining] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'appStats', 'counters')).then(snap => {
      if (snap.exists()) setSpotsRemaining(snap.data().spotsRemaining ?? 127);
    }).catch(() => {});
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="animate-scaleIn" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${colors.shadow}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
        <h2 style={{ color: colors.text, fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
          Unlock Unlimited Planning
        </h2>
        <p style={{ color: colors.textSecondary, marginBottom: '20px', lineHeight: '1.6' }}>
          Trips longer than 4 days require Lifetime Access. Pay once, plan forever.
        </p>

        {spotsRemaining !== null && spotsRemaining > 0 && (
          <div style={{
            padding: '8px 16px',
            backgroundColor: `${colors.danger}15`,
            color: colors.danger,
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '20px',
            display: 'inline-block',
          }}>
            Only {spotsRemaining} of 500 spots left
          </div>
        )}

        <div style={{
          padding: '16px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '10px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          {['Unlimited trip duration', 'Unlimited plans & members', 'All exports & analytics', 'Priority support + all future updates'].map((f, i) => (
            <div key={i} style={{
              padding: '4px 0',
              color: colors.text,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: colors.primary }}>✓</span> {f}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => { onClose(); navigate('/ltd'); }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${colors.primary}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Lifetime Access — $49
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
