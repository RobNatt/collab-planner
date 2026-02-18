import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

function Landing() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
    }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.primary,
        }}>
          Collab Planner
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '10px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      <section style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div className="animate-fadeIn">
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: '800',
            color: colors.text,
            marginBottom: '24px',
            lineHeight: '1.1',
          }}>
            Plan Together,<br />
            <span style={{ color: colors.primary }}>Adventure Together</span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: colors.textSecondary,
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
          }}>
            The all-in-one collaborative planning tool for group trips, events, and adventures.
            Organize tasks, track expenses, and keep everyone on the same page.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login?signup=true')}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
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
              Start Planning for Free
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                backgroundColor: 'transparent',
                color: colors.text,
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              See Features
            </button>
          </div>
        </div>

        {/* Hero Image/Illustration Placeholder */}
        <div style={{
          marginTop: '60px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '20px',
          boxShadow: `0 8px 32px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {['📋 Plan Tasks', '📅 Schedule Activities', '💰 Track Expenses', '👥 Collaborate'].map((item, i) => (
              <div key={i} style={{
                padding: '30px 20px',
                backgroundColor: colors.backgroundTertiary,
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.split(' ')[0]}</div>
                <div style={{ color: colors.text, fontWeight: '600' }}>{item.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{
        padding: '100px 40px',
        backgroundColor: colors.backgroundSecondary,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            Everything You Need to Plan Together
          </h2>
          <p style={{
            color: colors.textSecondary,
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 60px',
            fontSize: '18px',
          }}>
            From brainstorming to booking, we've got you covered.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}>
            {[
              {
                icon: '✅',
                title: 'Task Management',
                description: 'Create tasks and activities, assign to team members, set priorities and due dates. Track progress in real-time.',
                color: colors.primary,
              },
              {
                icon: '📅',
                title: 'Smart Scheduling',
                description: 'Propose dates, vote on suggestions, and automatically schedule activities. See everything on a visual calendar.',
                color: colors.warning,
              },
              {
                icon: '💰',
                title: 'Expense Tracking',
                description: 'Log expenses, split costs evenly or custom, and see who owes whom. Settle up with ease.',
                color: colors.success,
              },
              {
                icon: '👥',
                title: 'Easy Collaboration',
                description: 'Invite friends with a link or QR code. Everyone stays in sync with shared tasks and expenses.',
                color: colors.purple,
              },
              {
                icon: '📊',
                title: 'Analytics Dashboard',
                description: 'Track progress, view expense breakdowns by category, and see member contributions at a glance.',
                color: colors.danger,
              },
              {
                icon: '🌙',
                title: 'Beautiful Design',
                description: 'Clean, modern interface with dark mode support. Looks great on desktop and mobile.',
                color: colors.textSecondary,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-fadeIn"
                style={{
                  padding: '32px',
                  backgroundColor: colors.cardBg,
                  borderRadius: '16px',
                  boxShadow: `0 2px 12px ${colors.shadow}`,
                  border: `1px solid ${colors.border}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${colors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 12px ${colors.shadow}`;
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: `${feature.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '20px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  color: colors.text,
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  margin: 0,
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 40px',
        backgroundColor: colors.background,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px',
          }}>
            Simple, One-Time Pricing
          </h2>
          <p style={{
            color: colors.textSecondary,
            fontSize: '18px',
            marginBottom: '16px',
          }}>
            Lock in lifetime access before spots run out.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: `${colors.danger}15`,
            border: `1px solid ${colors.danger}40`,
            borderRadius: '20px',
            color: colors.danger,
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '40px',
          }}>
            Limited: Only 127 of 500 spots available
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}>
            {/* Free */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}>
              <h3 style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '36px', fontWeight: '800', color: colors.text, marginBottom: '4px' }}>$0</div>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>Forever free</p>
              <button
                onClick={() => navigate('/login?signup=true')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.backgroundTertiary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Get Started
              </button>
              {['1 trip plan', 'Up to 3 members', 'Max 4-day trips', 'Basic task management'].map((f, i) => (
                <div key={i} style={{ padding: '6px 0', color: colors.textSecondary, fontSize: '14px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: colors.success }}>✓</span> {f}
                </div>
              ))}
            </div>

            {/* LTD */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `2px solid ${colors.primary}`,
              position: 'relative',
              boxShadow: `0 4px 24px ${colors.primary}22`,
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 14px',
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
                Best Value
              </div>
              <h3 style={{ color: colors.primary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Lifetime Deal</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: colors.text }}>$49</span>
                <span style={{ color: colors.textSecondary, textDecoration: 'line-through' }}>$199</span>
              </div>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>One-time, lifetime access</p>
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '20px',
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
              {['Unlimited plans & members', 'Any trip duration', 'Advanced expenses + CSV export', 'Calendar & iCal export', 'Analytics dashboard', 'All future updates'].map((f, i) => (
                <div key={i} style={{ padding: '6px 0', color: colors.text, fontSize: '14px', display: 'flex', gap: '8px', fontWeight: i < 2 ? '600' : '400' }}>
                  <span style={{ color: colors.primary }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 40px',
        backgroundColor: colors.backgroundSecondary,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '48px',
          }}>
            Trusted by Groups Everywhere
          </h2>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            marginBottom: '60px',
          }}>
            {[
              { number: '1,000+', label: 'Plans Created' },
              { number: '5,000+', label: 'Tasks Completed' },
              { number: '500+', label: 'Happy Groups' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  color: colors.primary,
                }}>
                  {stat.number}
                </div>
                <div style={{ color: colors.textSecondary }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial placeholder */}
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '32px',
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
          }}>
            <p style={{
              fontSize: '20px',
              color: colors.text,
              fontStyle: 'italic',
              marginBottom: '20px',
              lineHeight: '1.6',
            }}>
              "Collab Planner made organizing our group trip so much easier.
              Everyone knew their tasks, and splitting expenses was a breeze!"
            </p>
            <div style={{ color: colors.textSecondary }}>
              — Happy User, Trip Organizer
            </div>
          </div>
        </div>
      </section>

      <section style={{
        padding: '100px 40px',
        backgroundColor: colors.primary,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
          }}>
            Ready to Plan Your Next Adventure?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '18px',
            marginBottom: '40px',
          }}>
            Join thousands of groups who plan smarter, not harder.
          </p>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '18px 48px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: colors.primary,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      <footer style={{
        padding: '40px',
        backgroundColor: colors.backgroundSecondary,
        textAlign: 'center',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {['About', 'Features', 'Pricing', 'Contact', 'Privacy', 'Terms'].map((link) => (
            <a
              key={link}
              href={link === 'Features' ? '#features' : link === 'Pricing' ? '#pricing' : '#'}
              style={{
                color: colors.textSecondary,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              {link}
            </a>
          ))}
        </div>
        <p style={{ color: colors.textMuted, fontSize: '14px' }}>
© 2026 Collab Planner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
