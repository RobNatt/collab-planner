import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LandingScreenshotCarousel } from '../components/LandingScreenshotCarousel';

function ScreenshotSlot({ colors, label }) {
  return (
    <div
      className="animate-fadeIn"
      style={{
        marginTop: '20px',
        borderRadius: '16px',
        border: `2px dashed ${colors.border}`,
        backgroundColor: colors.backgroundTertiary,
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textMuted,
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      {label}
    </div>
  );
}

function Section({ children, style = {}, id }) {
  return (
    <section id={id} style={{ padding: '56px 20px', ...style }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const goLtd = () => navigate('/ltd');
  const goDemo = () => navigate('/demo');

  const btnPrimary = {
    padding: '16px 22px',
    fontSize: '16px',
    fontWeight: '800',
    backgroundColor: colors.primary,
    color: 'white',
    borderRadius: '14px',
    border: 'none',
    width: '100%',
    maxWidth: '100%',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  };

  const btnSecondary = {
    padding: '16px 22px',
    fontSize: '16px',
    fontWeight: '700',
    backgroundColor: 'transparent',
    color: colors.text,
    borderRadius: '14px',
    border: `2px solid ${colors.border}`,
    width: '100%',
    cursor: 'pointer',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      paddingBottom: '100px',
    }}
    >
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        maxWidth: '720px',
        margin: '0 auto',
      }}
      >
        <div
          onClick={() => navigate('/')}
          style={{ fontSize: '20px', fontWeight: '800', color: colors.primary, cursor: 'pointer' }}
        >
          Collab Planner
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={goDemo}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '700',
              color: colors.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Demo
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => navigate(auth.currentUser ? '/dashboard' : '/login')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: colors.text,
              backgroundColor: colors.backgroundTertiary,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {auth.currentUser ? 'Dashboard' : 'Login'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <Section style={{ paddingTop: '28px', textAlign: 'center' }}>
        <h1 className="animate-fadeIn" style={{
          fontSize: 'clamp(30px, 7vw, 42px)',
          fontWeight: '900',
          lineHeight: 1.12,
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}
        >
          You plan the trip.<br />Everyone else just shows up.
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 4vw, 19px)',
          color: colors.textSecondary,
          lineHeight: 1.55,
          marginBottom: '28px',
        }}
        >
          Finally… a way to plan group trips without chasing people, juggling apps, or dealing with awkward money situations.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
          <button type="button" onClick={goDemo} style={btnPrimary}>
            Try a Demo Trip (No Signup)
          </button>
          <button type="button" onClick={goLtd} style={btnSecondary}>
            Get Lifetime Access — $49
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '13px', color: colors.textMuted, fontWeight: '500' }}>
          See a real trip in action — takes 60 seconds
        </p>
      </Section>

      {/* PROBLEM */}
      <Section style={{ backgroundColor: colors.backgroundSecondary }}>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', marginBottom: '16px' }}>
          Let&apos;s be honest… group trips are chaos
        </h2>
        <p style={{ color: colors.textSecondary, lineHeight: 1.6, marginBottom: '12px', fontSize: '16px' }}>
          It always starts the same way…
        </p>
        <p style={{ fontStyle: 'italic', color: colors.text, marginBottom: '16px', fontSize: '17px' }}>
          &ldquo;Let&apos;s plan a trip.&rdquo;
        </p>
        <p style={{ color: colors.textSecondary, lineHeight: 1.6, marginBottom: '12px', fontSize: '15px' }}>
          And somehow it turns into this:
        </p>
        <ul style={{ color: colors.textSecondary, lineHeight: 1.75, fontSize: '15px', paddingLeft: '18px', marginBottom: '16px' }}>
          <li>Ideas scattered across messages</li>
          <li>Plans sitting in Notes app</li>
          <li>Dates constantly changing</li>
          <li>No one actually deciding anything</li>
          <li>And you… doing everything</li>
        </ul>
        <p style={{ color: colors.text, fontWeight: '600', marginBottom: '8px' }}>Then comes the worst part:</p>
        <p style={{ fontSize: '16px', marginBottom: '6px' }}>💸 &ldquo;Wait… who paid for what?&rdquo;</p>
        <p style={{ fontSize: '16px', color: colors.textSecondary }}>💬 &ldquo;Did we already split this?&rdquo;</p>
        <p style={{ marginTop: '16px', color: colors.textSecondary, lineHeight: 1.55 }}>
          Now it&apos;s not fun anymore. It&apos;s work.
        </p>
      </Section>

      {/* SOLUTION */}
      <Section>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', marginBottom: '14px' }}>
          This replaces all of that with one simple system
        </h2>
        <p style={{ color: colors.textSecondary, lineHeight: 1.6, marginBottom: '20px', fontSize: '16px' }}>
          Collab Planner puts everything in one place so the trip actually comes together — without you forcing it.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { t: 'Invite your friends in seconds', s: 'No more chasing people across apps' },
            { t: 'Vote on activities together', s: 'No more “I don’t care, you pick”' },
            { t: 'Track & split expenses automatically', s: 'No awkward money conversations' },
            { t: 'Build a shared itinerary', s: 'Everyone knows the plan' },
          ].map((row) => (
            <li key={row.t} className="animate-fadeIn" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px', lineHeight: 1.2 }}>✅</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>{row.t}</div>
                <div style={{ color: colors.textMuted, fontSize: '14px', marginTop: '4px' }}>{row.s}</div>
              </div>
            </li>
          ))}
        </ul>
        <LandingScreenshotCarousel colors={colors} />
      </Section>

      {/* HOW IT WORKS */}
      <Section style={{ backgroundColor: colors.backgroundSecondary }}>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', marginBottom: '20px' }}>
          Plan a trip in 3 simple steps
        </h2>
        <ol style={{ paddingLeft: '20px', margin: 0, color: colors.textSecondary, lineHeight: 1.85, fontSize: '16px' }}>
          <li style={{ marginBottom: '8px' }}><strong style={{ color: colors.text }}>Create your trip</strong></li>
          <li style={{ marginBottom: '8px' }}><strong style={{ color: colors.text }}>Invite your friends</strong></li>
          <li><strong style={{ color: colors.text }}>Let the app handle the rest</strong></li>
        </ol>
        <p style={{ marginTop: '16px', fontSize: '14px', color: colors.textMuted }}>
          No learning curve. No setup headache.
        </p>
      </Section>

      {/* MATH */}
      <Section>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', marginBottom: '12px' }}>
          Still using 4+ apps to plan one trip?
        </h2>
        <p style={{ color: colors.textSecondary, lineHeight: 1.6, marginBottom: '12px', fontSize: '15px' }}>
          Most people don&apos;t realize how inefficient their setup is:
        </p>
        <ul style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.7, paddingLeft: '18px', marginBottom: '16px' }}>
          <li>Notes → ideas</li>
          <li>Messages → coordination</li>
          <li>Splitwise → expenses</li>
          <li>Calendar → schedule</li>
        </ul>
        <p style={{ fontSize: '15px', marginBottom: '8px' }}>That&apos;s 4 tools… and still confusion.</p>
        <p style={{ fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Collab Planner replaces ALL of it</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '15px', lineHeight: 1.7 }}>
          <li>✓ Save 3–5 hours per trip</li>
          <li>✓ Avoid awkward money situations</li>
          <li>✓ Actually get everyone involved</li>
        </ul>
        <div style={{
          padding: '16px',
          borderRadius: '14px',
          backgroundColor: colors.backgroundTertiary,
          border: `1px solid ${colors.border}`,
        }}
        >
          <p style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: colors.primary }}>One-time: $49</p>
          <p style={{ margin: '6px 0 0', color: colors.textSecondary, fontSize: '14px' }}>Use it forever</p>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: colors.textMuted, lineHeight: 1.5 }}>
            Less than what most people lose on ONE messy group dinner split
          </p>
        </div>
        <ScreenshotSlot colors={colors} label="Demo / product preview (add screenshot)" />
      </Section>

      {/* IDENTITY */}
      <Section style={{ backgroundColor: colors.backgroundSecondary }}>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', marginBottom: '14px' }}>
          This is for the friend who always ends up planning everything
        </h2>
        <p style={{ color: colors.textSecondary, lineHeight: 1.65, marginBottom: '12px', fontSize: '15px' }}>
          You&apos;re the one who:
        </p>
        <ul style={{ color: colors.textSecondary, paddingLeft: '18px', lineHeight: 1.75, marginBottom: '12px' }}>
          <li>organizes everything</li>
          <li>keeps track of people</li>
          <li>manages the money</li>
          <li>makes the decisions</li>
        </ul>
        <p style={{ color: colors.textMuted, fontStyle: 'italic', marginBottom: '8px' }}>
          While everyone else says: &ldquo;Yeah I&apos;m down for whatever&rdquo;
        </p>
        <p style={{ fontWeight: '700', fontSize: '16px' }}>This changes that.</p>
      </Section>

      {/* TESTIMONIALS */}
      <Section>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
          What planners say
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { q: 'I used to manage everything manually… now it\'s all in one place.', a: 'Jason' },
            { q: 'Everyone actually participates now.', a: 'Amanda' },
            { q: 'No more awkward money convos.', a: 'Chris' },
          ].map((t) => (
            <blockquote
              key={t.a}
              style={{
                margin: 0,
                padding: '16px',
                borderRadius: '14px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.cardBg,
                fontSize: '15px',
                lineHeight: 1.55,
              }}
            >
              <p style={{ margin: 0 }}>&ldquo;{t.q}&rdquo;</p>
              <footer style={{ marginTop: '10px', color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>— {t.a}</footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* OFFER */}
      <Section style={{ backgroundColor: colors.backgroundSecondary, textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '900', marginBottom: '12px' }}>
          Pay once. Use it forever.
        </h2>
        <p style={{ color: colors.textSecondary, lineHeight: 1.6, marginBottom: '8px', fontSize: '15px' }}>
          Unlimited trips<br />
          Unlimited collaborators<br />
          All current + future features
        </p>
        <p style={{ fontSize: '36px', fontWeight: '900', color: colors.primary, margin: '16px 0' }}>$49</p>
        <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '12px' }}>No subscriptions.</p>
        <p style={{ fontSize: '14px', color: colors.warning, fontWeight: '700' }}>
          This lifetime deal will not stay forever.
        </p>
      </Section>

      {/* FINAL CTA */}
      <Section style={{ textAlign: 'center', paddingBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
          <button type="button" onClick={goDemo} style={btnPrimary}>
            Try a Demo Trip (No Signup)
          </button>
          <button type="button" onClick={goLtd} style={btnSecondary}>
            Get Lifetime Access — $49
          </button>
        </div>
        <p style={{ marginTop: '14px', fontSize: '13px', color: colors.textMuted }}>
          Takes 60 seconds. No pressure.
        </p>
      </Section>

      <footer style={{
        textAlign: 'center',
        padding: '24px 20px 32px',
        borderTop: `1px solid ${colors.border}`,
        fontSize: '13px',
        color: colors.textMuted,
      }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginBottom: '12px' }}>
          <Link to="/blog" style={{ color: colors.primary, fontWeight: '600' }}>Blog</Link>
          <Link to="/plans/monthly" style={{ color: colors.primary, fontWeight: '600' }}>Subscriptions</Link>
          <Link to="/terms" style={{ color: colors.primary, fontWeight: '600' }}>Terms</Link>
          <Link to="/privacy" style={{ color: colors.primary, fontWeight: '600' }}>Privacy</Link>
        </div>
        © {new Date().getFullYear()} Collab Planner
      </footer>

      <div
        className="funnel-landing-sticky"
        style={{
          backgroundColor: `${colors.cardBg}f2`,
          borderTop: `1px solid ${colors.border}`,
          boxShadow: `0 -8px 28px ${colors.shadow}`,
        }}
      >
        <button type="button" onClick={goDemo} style={{ ...btnPrimary, flex: 1, padding: '14px 12px', fontSize: '15px' }}>
          Try Demo Trip
        </button>
        <button
          type="button"
          onClick={goLtd}
          style={{
            ...btnSecondary,
            flex: 1,
            padding: '14px 10px',
            fontSize: '14px',
            borderWidth: '1px',
          }}
        >
          Lifetime $49
        </button>
      </div>
    </div>
  );
}

export default Landing;
