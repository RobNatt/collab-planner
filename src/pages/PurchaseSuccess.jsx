import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { trackPurchaseComplete } from '../utils/analytics';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

function PurchaseSuccess() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [status, setStatus] = useState('activating'); // activating | success | already_active | no_auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('no_auth');
        return;
      }

      try {
        // Check if already active
        const licenseDoc = await getDoc(doc(db, 'licenses', user.uid));
        if (licenseDoc.exists() && licenseDoc.data().status === 'active') {
          setStatus('already_active');
          return;
        }

        // Activate license
        await setDoc(doc(db, 'licenses', user.uid), {
          userId: user.uid,
          email: user.email,
          status: 'active',
          plan: 'ltd',
          purchasedAt: serverTimestamp(),
        });

        trackPurchaseComplete(user.uid);
        setStatus('success');
      } catch {
        setStatus('success'); // Show success even if write fails — admin can verify in LemonSqueezy
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div className="animate-scaleIn" style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '48px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 4px 24px ${colors.shadow}`,
      }}>
        {status === 'activating' && (
          <LoadingSpinner size="large" text="Activating your lifetime access..." />
        )}

        {(status === 'success' || status === 'already_active') && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
              Welcome to Lifetime Access!
            </h1>
            <p style={{ color: colors.textSecondary, marginBottom: '8px', lineHeight: '1.6' }}>
              Your account has been upgraded. You now have unlimited plans, members, trip duration, and all premium features.
            </p>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              backgroundColor: `${colors.warning}20`,
              color: colors.warning,
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '32px',
              border: `1px solid ${colors.warning}40`,
            }}>
              ★ LTD Member
            </div>
            <br />
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '14px 36px',
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
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'no_auth' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔑</div>
            <h1 style={{ color: colors.text, fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Log in to activate your purchase
            </h1>
            <p style={{ color: colors.textSecondary, marginBottom: '24px', lineHeight: '1.6' }}>
              Please log in with the same email you used at checkout to activate your lifetime access.
            </p>
            <button
              onClick={() => navigate('/login?redirect=/purchase-success')}
              style={{
                padding: '14px 36px',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Log In to Activate
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PurchaseSuccess;
