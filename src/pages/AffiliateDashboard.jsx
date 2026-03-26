import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function AffiliateDashboard() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login?redirect=/affiliate-dashboard');
      return;
    }
    checkAffiliateAccess();
  }, [auth.currentUser]);

  const checkAffiliateAccess = async () => {
    try {
      const q = query(
        collection(db, 'affiliates'),
        where('userId', '==', auth.currentUser?.uid),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setAffiliate(snap.docs[0].data());
      } else {
        setAffiliate(null);
      }
    } catch (err) {
      console.error(err);
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setVerifying(true);
    try {
      const q = query(
        collection(db, 'affiliates'),
        where('code', '==', codeInput.trim().toUpperCase()),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      if (!snap.empty && snap.docs[0].data().userId === auth.currentUser.uid) {
        setAffiliate(snap.docs[0].data());
        toast.success('Access granted!');
      } else {
        toast.error('Invalid or unauthorized affiliate code.');
      }
    } catch (err) {
      toast.error('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralUrl = affiliate?.code ? `${baseUrl}/?ref=${affiliate.code}` : '';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, transition: 'background-color 0.3s ease' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div onClick={() => navigate('/')} style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, cursor: 'pointer' }}>
          Collab Planner
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Main Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {affiliate ? (
          <>
            <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Affiliate Dashboard
            </h1>
            <p style={{ color: colors.textSecondary, marginBottom: '32px' }}>
              Your referral link and stats. Earn 20% on first payment, 5% recurring after 3 months.
            </p>

            <div style={{
              padding: '24px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `2px solid ${colors.primary}`,
              marginBottom: '24px',
              boxShadow: `0 4px 24px ${colors.primary}22`,
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px', textTransform: 'uppercase' }}>
                Your Affiliate Code
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text, fontFamily: 'monospace', letterSpacing: '2px' }}>
                {affiliate.code}
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>
                Your Referral Link
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    backgroundColor: colors.backgroundTertiary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.text,
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralUrl);
                    toast.success('Link copied!');
                  }}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}>
              <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                Commission Structure
              </h3>
              <ul style={{ color: colors.textSecondary, lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                <li>20% on the first payment when a customer uses your link</li>
                <li>5% recurring commission after 3 months from each referred subscriber</li>
              </ul>
              <p style={{ color: colors.textMuted, fontSize: '14px', marginTop: '16px', marginBottom: 0 }}>
                Stats and payouts are processed manually. Contact us for earnings inquiries.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Affiliate Access
            </h1>
            <p style={{ color: colors.textSecondary, marginBottom: '32px' }}>
              Enter your affiliate code to access the dashboard. If you've been approved, you'll receive your code via email.
            </p>

            <form onSubmit={handleVerifyCode} style={{
              maxWidth: '400px',
              padding: '32px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500' }}>
                Affiliate Code
              </label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. TG_AFF_XXXXX"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  color: colors.text,
                  marginBottom: '16px',
                }}
              />
              <button
                type="submit"
                disabled={verifying}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: verifying ? colors.textMuted : colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: verifying ? 'not-allowed' : 'pointer',
                }}
              >
                {verifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <p style={{ color: colors.textMuted, fontSize: '14px', marginTop: '24px' }}>
              Not an affiliate yet? <button onClick={() => navigate('/affiliates')} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Apply here</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AffiliateDashboard;
