import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { getMarketingPlanBySlug } from '../data/pricingPlans';
import NotFound from './NotFound';

function PlanPage() {
  const { planSlug } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const plan = planSlug ? getMarketingPlanBySlug(planSlug) : null;

  if (!plan) {
    return <NotFound />;
  }

  const benefits = plan.benefits || plan.features;

  const handleCta = () => {
    if (plan.id === 'pay_per_trip') {
      const payLink = import.meta.env.VITE_STRIPE_PAY_PER_TRIP_LINK;
      if (payLink && auth.currentUser) {
        const url = `${payLink}?client_reference_id=${auth.currentUser.uid}&prefilled_email=${encodeURIComponent(auth.currentUser.email)}`;
        window.location.href = url;
      } else {
        navigate('/login?signup=true');
      }
      return;
    }
    const link = plan.stripeEnvKey ? import.meta.env[plan.stripeEnvKey] : null;
    if (link) {
      if (auth.currentUser) {
        const url = `${link}?client_reference_id=${auth.currentUser.uid}&prefilled_email=${encodeURIComponent(auth.currentUser.email)}`;
        window.location.href = url;
      } else {
        navigate('/login?redirect=/');
      }
    } else {
      navigate('/login?signup=true');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
    }}
    >
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '900px',
        margin: '0 auto',
      }}
      >
        <Link
          to="/#pricing"
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: colors.primary,
            textDecoration: 'none',
          }}
        >
          ← Compare all plans
        </Link>
        <ThemeToggle />
      </nav>

      <article style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 40px 80px',
      }}
      >
        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.textSecondary,
          marginBottom: '12px',
        }}
        >
          Pricing
        </p>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: '800',
          color: colors.text,
          marginTop: 0,
          marginBottom: '12px',
          lineHeight: 1.15,
        }}
        >
          {plan.name}
        </h1>
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: '800',
            color: colors.primary,
          }}
          >
            {plan.price}
          </span>
          <span style={{ fontSize: '18px', color: colors.textSecondary, marginLeft: '8px' }}>
            {plan.priceNote}
          </span>
          {plan.trialLabel && (
            <span style={{
              display: 'inline-block',
              marginLeft: '12px',
              padding: '4px 10px',
              backgroundColor: `${colors.primary}18`,
              color: colors.primary,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
            }}
            >
              {plan.trialLabel}
            </span>
          )}
          {plan.savings && (
            <span style={{
              display: 'inline-block',
              marginLeft: '12px',
              padding: '4px 10px',
              backgroundColor: `${colors.success}20`,
              color: colors.success,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
            }}
            >
              {plan.savings}
            </span>
          )}
        </div>
        <p style={{
          color: colors.textSecondary,
          fontSize: '18px',
          lineHeight: 1.65,
          marginBottom: '36px',
        }}
        >
          {plan.description}
        </p>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.text,
          marginBottom: '16px',
        }}
        >
          Why this plan
        </h2>
        <ul style={{
          margin: 0,
          paddingLeft: '22px',
          color: colors.text,
          lineHeight: 1.75,
          fontSize: '16px',
        }}
        >
          {benefits.map((line) => (
            <li key={line} style={{ marginBottom: '12px' }}>{line}</li>
          ))}
        </ul>

        {plan.ctaNote && (
          <p style={{
            marginTop: '28px',
            fontSize: '14px',
            color: colors.textMuted,
            lineHeight: 1.6,
          }}
          >
            {plan.ctaNote}
          </p>
        )}

        <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCta}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {plan.cta}
          </button>
          <Link
            to="/#pricing"
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              textDecoration: 'none',
              alignSelf: 'center',
            }}
          >
            Back to comparison table
          </Link>
        </div>
      </article>
    </div>
  );
}

export default PlanPage;
