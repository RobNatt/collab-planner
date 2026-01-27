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
          {/* AD COPY: Replace with your brand logo/name */}
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

      {/* ================================================================
          HERO SECTION - Main headline and call-to-action
          AD COPY LOCATION: Update headline, subheadline, and CTA text
          ================================================================ */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div className="animate-fadeIn">
          {/* AD COPY: Main headline - Make it compelling and benefit-focused */}
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

          {/* AD COPY: Subheadline - Explain the value proposition */}
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

          {/* AD COPY: Primary CTA button */}
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
          {/* AD COPY: Add a screenshot or illustration of your app here */}
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

      {/* ================================================================
          FEATURES SECTION - Highlight key features
          AD COPY LOCATION: Update feature titles and descriptions
          ================================================================ */}
      <section id="features" style={{
        padding: '100px 40px',
        backgroundColor: colors.backgroundSecondary,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* AD COPY: Section headline */}
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
            {/* AD COPY: Section subheadline */}
            From brainstorming to booking, we've got you covered.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}>
            {/* AD COPY: Feature cards - Update icons, titles, and descriptions */}
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

      {/* ================================================================
          SOCIAL PROOF SECTION - Testimonials or stats
          AD COPY LOCATION: Add testimonials, user count, or trust badges
          ================================================================ */}
      <section style={{
        padding: '80px 40px',
        backgroundColor: colors.background,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* AD COPY: Add social proof - testimonials, user stats, or trust badges */}
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
            {/* AD COPY: Update these stats with real numbers */}
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
          {/* AD COPY: Add real testimonials from users */}
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

      {/* ================================================================
          CTA SECTION - Final call-to-action
          AD COPY LOCATION: Update the final CTA headline and button
          ================================================================ */}
      <section style={{
        padding: '100px 40px',
        backgroundColor: colors.primary,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* AD COPY: Final CTA headline */}
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
            {/* AD COPY: Final CTA subheadline */}
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

      {/* ================================================================
          FOOTER
          AD COPY LOCATION: Update links and copyright
          ================================================================ */}
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
          {/* AD COPY: Add your footer links */}
          {['About', 'Features', 'Pricing', 'Contact', 'Privacy', 'Terms'].map((link) => (
            <a
              key={link}
              href="#"
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
          {/* AD COPY: Update copyright */}
          © 2025 Collab Planner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
