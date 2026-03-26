import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { collaboratorChargeSummary } from '../utils/inviteBilling';

export const AUTO_JOIN_KEY = 'collabPlanner_autoJoinInvite';

function InviteLanding() {
  const { inviteCode: rawCode } = useParams();
  const inviteCode = rawCode?.toUpperCase() || '';
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [legacyInvite, setLegacyInvite] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'inviteLinks', inviteCode));
        if (cancelled) return;

        if (!snap.exists()) {
          setLegacyInvite(true);
          setMeta({
            planName: 'a trip plan',
            hostDisplayName: 'your organizer',
            billingKind: 'free',
          });
          setLoading(false);
          return;
        }

        const data = snap.data();
        if (data.inviteExpiresAt) {
          const expiresAt = data.inviteExpiresAt.toDate
            ? data.inviteExpiresAt.toDate()
            : new Date(data.inviteExpiresAt);
          if (new Date() > expiresAt) {
            setError('This invite has expired. Ask the plan admin for a new link.');
            setLoading(false);
            return;
          }
        }

        setMeta({
          planName: data.planName || 'Trip plan',
          hostDisplayName: data.hostDisplayName || 'The organizer',
          billingKind: data.billingKind || 'free',
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Could not load this invite. Try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const goLogin = (signup) => {
    const q = new URLSearchParams();
    q.set('redirect', `/join/${inviteCode}`);
    if (signup) q.set('signup', 'true');
    navigate(`/login?${q.toString()}`);
  };

  const handleYes = () => {
    try {
      sessionStorage.setItem(AUTO_JOIN_KEY, inviteCode);
    } catch (_) { /* ignore */ }
    goLogin(true);
  };

  const handleYesExisting = () => {
    try {
      sessionStorage.setItem(AUTO_JOIN_KEY, inviteCode);
    } catch (_) { /* ignore */ }
    goLogin(false);
  };

  const handleNo = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <ThemeToggle />
        </div>
        <div style={{
          width: '100%',
          maxWidth: '560px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 4px 24px ${colors.shadow}`,
        }}>
          <Skeleton width="70%" height="28px" style={{ margin: '0 auto 24px' }} />
          <SkeletonText lines={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <ThemeToggle />
        </div>
        <div style={{
          maxWidth: '520px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          textAlign: 'center',
          border: `1px solid ${colors.border}`,
        }}>
          <p style={{ color: colors.danger, marginBottom: '20px' }}>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const chargeLine = collaboratorChargeSummary(meta.billingKind);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 4px 24px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
      }}>
        <h1 style={{ marginTop: 0, color: colors.text, fontSize: '1.75rem', textAlign: 'center' }}>
          Join {meta.hostDisplayName}&apos;s trip?
        </h1>
        <p style={{
          color: colors.textSecondary,
          fontSize: '1.1rem',
          textAlign: 'center',
          lineHeight: 1.5,
          marginBottom: '8px',
        }}>
          <strong style={{ color: colors.text }}>{meta.planName}</strong>
          {legacyInvite && (
            <span style={{ display: 'block', fontSize: '0.9rem', marginTop: '8px', color: colors.textMuted }}>
              (Details will be confirmed after you sign in.)
            </span>
          )}
        </p>

        <div style={{
          margin: '24px 0',
          padding: '16px 18px',
          backgroundColor: `${colors.warning}12`,
          borderRadius: '12px',
          border: `1px solid ${colors.warning}35`,
          color: colors.textSecondary,
          fontSize: '14px',
          lineHeight: 1.55,
        }}>
          <strong style={{ color: colors.text }}>Billing note:</strong>{' '}
          {legacyInvite
            ? 'Individual plans usually charge the organizer $1 when a collaborator joins; Business plans include the first 10 collaborators. You will not be charged on your own card for this fee.'
            : chargeLine}
        </div>

        <p style={{ color: colors.textMuted, fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
          You&apos;ll get a short tour, then go straight to this plan with collaborator access (no full dashboard until you create your own plan).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={handleYes}
            style={{
              padding: '16px 24px',
              fontSize: '17px',
              fontWeight: 700,
              backgroundColor: colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Yes — create account &amp; join
          </button>
          <button
            type="button"
            onClick={handleYesExisting}
            style={{
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 600,
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Yes — I already have an account
          </button>
          <button
            type="button"
            onClick={handleNo}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            No thanks, go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default InviteLanding;
