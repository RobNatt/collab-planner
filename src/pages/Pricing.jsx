import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLicense } from '../hooks/useLicense';
import toast from 'react-hot-toast';

function Pricing() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [spotsRemaining, setSpotsRemaining] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const { isLTD } = useLicense(auth.currentUser?.uid);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const statsDoc = await getDoc(doc(db, 'appStats', 'counters'));
        if (statsDoc.exists()) {
          setSpotsRemaining(statsDoc.data().spotsRemaining ?? 127);
        } else {
          // Initialize counters doc if it doesn't exist
          await setDoc(doc(db, 'appStats', 'counters'), {
            spotsRemaining: 127,
            totalSignups: 0,
          });
          setSpotsRemaining(127);
        }
      } catch {
        setSpotsRemaining(127);
      }
    };
    fetchSpots();
  }, []);

  const handleCheckout = () => {
    const checkoutUrl = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL;
    if (!checkoutUrl) {
      toast.error('Payment system is being configured. Please try again soon.');
      return;
    }

    if (!auth.currentUser) {
      navigate('/login?redirect=/pricing');
      return;
    }

    // Open LemonSqueezy checkout with user email prefilled and redirect back to success page
    const successUrl = `${window.location.origin}/purchase-success`;
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    const fullUrl = `${checkoutUrl}${separator}checkout[email]=${encodeURIComponent(auth.currentUser.email)}&checkout[custom][user_id]=${auth.currentUser.uid}&checkout[success_url]=${encodeURIComponent(successUrl)}`;
    window.location.href = fullUrl;
  };

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    try {
      await addDoc(collection(db, 'waitlist'), {
        email: waitlistEmail,
        createdAt: serverTimestamp(),
      });
      setWaitlistSubmitted(true);
      toast.success("You're on the waitlist!");
    } catch {
      toast.error('Something went wrong. Try again.');
    }
  };

  const isSoldOut = spotsRemaining !== null && spotsRemaining <= 0;

  const freeFeatures = [
    '1 trip plan',
    'Up to 3 members',
    'Max 4-day trips',
    'Basic task management',
    'Simple expense tracking',
  ];

  const ltdFeatures = [
    'Unlimited trip plans',
    'Unlimited members',
    'Any trip duration',
    'Full task & activity management',
    'Advanced expense tracking + CSV export',
    'Calendar & iCal export',
    'Analytics dashboard',
    'Real-time notifications',
    'Priority support',
    'All future updates',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
    }}>
      {/* Nav */}
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
          Collab Planner
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

      {/* Header */}
      <section style={{
        padding: '60px 40px 20px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '800',
          color: colors.text,
          marginBottom: '16px',
        }}>
          Simple, One-Time Pricing
        </h1>
        <p style={{
          fontSize: '18px',
          color: colors.textSecondary,
          lineHeight: '1.6',
        }}>
          Get lifetime access to every feature. No subscriptions, no hidden fees.
        </p>

        {/* Urgency counter */}
        {spotsRemaining !== null && !isSoldOut && (
          <div className="animate-fadeIn" style={{
            display: 'inline-block',
            marginTop: '24px',
            padding: '10px 24px',
            backgroundColor: `${colors.danger}15`,
            border: `1px solid ${colors.danger}40`,
            borderRadius: '24px',
            color: colors.danger,
            fontWeight: '700',
            fontSize: '15px',
          }}>
            Only {spotsRemaining} of 500 spots remaining
          </div>
        )}
      </section>

      {/* Pricing Cards */}
      <section style={{
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {/* Free Tier */}
        <div style={{
          padding: '36px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 2px 12px ${colors.shadow}`,
        }}>
          <h3 style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Free
          </h3>
          <div style={{ fontSize: '42px', fontWeight: '800', color: colors.text, marginBottom: '4px' }}>
            $0
          </div>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
            Forever free, no card required
          </p>
          <button
            onClick={() => navigate(auth.currentUser ? '/dashboard' : '/login?signup=true')}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `2px solid ${colors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.backgroundTertiary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {auth.currentUser ? 'Go to Dashboard' : 'Get Started'}
          </button>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {freeFeatures.map((f, i) => (
              <li key={i} style={{
                padding: '8px 0',
                color: colors.textSecondary,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ color: colors.success }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* LTD Tier */}
        <div style={{
          padding: '36px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          border: `2px solid ${colors.primary}`,
          boxShadow: `0 4px 24px ${colors.primary}22`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 16px',
            backgroundColor: colors.primary,
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Best Value
          </div>
          <h3 style={{ color: colors.primary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Lifetime Deal
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '42px', fontWeight: '800', color: colors.text }}>$49</span>
            <span style={{ color: colors.textSecondary, textDecoration: 'line-through', fontSize: '18px' }}>$199</span>
          </div>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
            One-time payment, lifetime access
          </p>

          {isLTD ? (
            <div style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: `${colors.success}15`,
              color: colors.success,
              border: `2px solid ${colors.success}`,
              borderRadius: '10px',
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              ✓ You have Lifetime Access
            </div>
          ) : isSoldOut ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: `${colors.danger}15`,
                color: colors.danger,
                border: `2px solid ${colors.danger}`,
                borderRadius: '10px',
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                SOLD OUT
              </div>
              {!waitlistSubmitted ? (
                <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    placeholder="Enter email for waitlist"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '14px',
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      borderRadius: '8px',
                      color: colors.text,
                    }}
                  />
                  <button type="submit" style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}>
                    Notify Me
                  </button>
                </form>
              ) : (
                <p style={{ color: colors.success, fontSize: '14px', textAlign: 'center' }}>
                  You'll be notified when spots open up!
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleCheckout}
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
                marginBottom: '24px',
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
              Get Lifetime Access
            </button>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {ltdFeatures.map((f, i) => (
              <li key={i} style={{
                padding: '8px 0',
                color: colors.text,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: i < 3 ? '600' : '400',
              }}>
                <span style={{ color: colors.primary }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        padding: '60px 40px',
        maxWidth: '700px',
        margin: '0 auto',
      }}>
        <h2 style={{ color: colors.text, textAlign: 'center', marginBottom: '32px', fontSize: '28px', fontWeight: '700' }}>
          Frequently Asked Questions
        </h2>
        {[
          { q: 'What does "lifetime" mean?', a: 'Pay once, use forever. You get access to all current and future features with no recurring charges.' },
          { q: 'Can I try it before buying?', a: 'Yes! The free tier lets you create a plan with up to 3 members and 4-day trips. Upgrade anytime.' },
          { q: 'What happens after 500 spots sell out?', a: 'The lifetime deal expires and we switch to monthly/yearly subscription pricing at a higher rate.' },
          { q: 'Is there a refund policy?', a: 'Yes, we offer a 14-day money-back guarantee. No questions asked.' },
        ].map((faq, i) => (
          <div key={i} style={{
            padding: '20px 0',
            borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none',
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              {faq.q}
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: '1.6', margin: 0 }}>
              {faq.a}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Pricing;
