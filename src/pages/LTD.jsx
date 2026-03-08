import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { trackCheckoutStarted } from '../utils/analytics';
import toast from 'react-hot-toast';

function LTD() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleCheckout = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (!paymentLink) {
      toast.error('Payment system is being configured. Please try again soon.');
      return;
    }

    if (!auth.currentUser) {
      navigate('/login?redirect=/ltd');
      return;
    }

    const fullUrl = `${paymentLink}?prefilled_email=${encodeURIComponent(auth.currentUser.email)}&client_reference_id=${auth.currentUser.uid}`;
    trackCheckoutStarted();
    window.location.href = fullUrl;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.primary,
            cursor: 'pointer',
          }}
        >
          Travel Gang
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          {auth.currentUser ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 24px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 24px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <section style={{
        padding: '80px 40px',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          backgroundColor: `${colors.warning}15`,
          border: `1px solid ${colors.warning}40`,
          borderRadius: '24px',
          color: colors.warning,
          fontWeight: '700',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          🔓 Secret Offer
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: '800',
          color: colors.text,
          marginBottom: '24px',
          lineHeight: '1.2',
        }}>
          Congratulations! You found our Lifetime Deal offer!
        </h1>

        <p style={{
          fontSize: '18px',
          color: colors.textSecondary,
          lineHeight: '1.7',
          marginBottom: '32px',
        }}>
          For just <strong style={{ color: colors.text }}>$49</strong> right now, you will have the exclusive privilege
          of only paying <strong style={{ color: colors.text }}>$1 per collaborator</strong> on all future trips —
          and unlimited access to new features as they roll out.
        </p>

        <div style={{
          padding: '24px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          border: `2px solid ${colors.primary}`,
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              '$49 one-time payment',
              '$1 per collaborator on all future trips',
              'Unlimited trip plans & duration',
              'All current and future features',
              'No recurring subscription',
            ].map((item, i) => (
              <li key={i} style={{
                padding: '8px 0',
                color: colors.text,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ color: colors.success }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          style={{
            padding: '18px 48px',
            fontSize: '18px',
            fontWeight: '700',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}44`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Lifetime Access — $49
        </button>

        <p style={{ marginTop: '24px', color: colors.textMuted, fontSize: '14px' }}>
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ color: colors.textSecondary }}>← Back to pricing</a>
        </p>
      </section>
    </div>
  );
}

export default LTD;
