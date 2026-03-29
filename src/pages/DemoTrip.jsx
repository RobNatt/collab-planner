import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { FunnelPaywallModal } from '../components/funnel/FunnelPaywallModal';
import { EmailCaptureModal } from '../components/funnel/EmailCaptureModal';
import { DemoPitchPopup } from '../components/funnel/DemoPitchPopup';

const PITCH_KEY = 'collabPlanner_demoPitchSeen';
const EMAIL_SESSION_KEY = 'collabPlanner_demoEmailOffered';

function DemoTrip() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const emailOfferedRef = useRef(false);

  const openPaywall = useCallback(() => setPaywallOpen(true), []);

  const offerEmailCapture = useCallback(() => {
    if (emailOfferedRef.current) return;
    try {
      if (sessionStorage.getItem(EMAIL_SESSION_KEY)) return;
      sessionStorage.setItem(EMAIL_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    emailOfferedRef.current = true;
    setEmailOpen(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem(PITCH_KEY)) return;
        sessionStorage.setItem(PITCH_KEY, '1');
      } catch {
        /* ignore */
      }
      setPitchOpen(true);
    }, 12500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(offerEmailCapture, 28000);
    return () => clearTimeout(t);
  }, [offerEmailCapture]);

  useEffect(() => {
    const onLeave = (e) => {
      if (e.clientY > 0) return;
      offerEmailCapture();
    };
    document.addEventListener('mouseout', onLeave);
    return () => document.removeEventListener('mouseout', onLeave);
  }, [offerEmailCapture]);

  const members = [
    { name: 'Alex', note: 'paid' },
    { name: 'Jess', note: '' },
    { name: 'Mike', note: '' },
    { name: 'You', note: 'viewer' },
  ];

  const activities = [
    { title: 'Boat Party', votes: 6 },
    { title: 'Dinner Reservation', votes: 4 },
    { title: 'Beach Day', votes: 5 },
  ];

  const expenses = [
    { label: 'Airbnb', amount: '$800', split: 'split 4 ways' },
    { label: 'Dinner', amount: '$200', split: '' },
    { label: 'Uber', amount: '$60', split: '' },
  ];

  const itinerary = [
    'Day 1: Arrival + Dinner',
    'Day 2: Boat Party + Beach',
    'Day 3: Brunch + Leave',
  ];

  const card = {
    border: `1px solid ${colors.border}`,
    borderRadius: '14px',
    padding: '16px',
    backgroundColor: colors.cardBg,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, paddingBottom: '88px' }}>
      <div style={{
        backgroundColor: `${colors.primary}14`,
        borderBottom: `1px solid ${colors.primary}35`,
        padding: '12px 16px',
        textAlign: 'center',
      }}
      >
        <div style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>👋 Welcome — this is a demo trip</div>
        <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '4px' }}>Tap around. Everything works.</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', maxWidth: '720px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundTertiary,
            color: colors.text,
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          ← Home
        </button>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px 24px' }}>
        <h1 style={{ margin: '0 0 6px', color: colors.text, fontSize: 'clamp(24px, 5vw, 30px)', fontWeight: '800' }}>
          Miami Weekend 🌴
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>Demo · No account required</p>

        <div style={{ ...card, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', color: colors.text }}>Members</h2>
            <button
              type="button"
              onClick={openPaywall}
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: colors.primary,
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
              }}
            >
              + Invite
            </button>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {members.map((m) => (
              <li key={m.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '15px',
              }}
              >
                <span>{m.name}</span>
                {m.note && <span style={{ color: colors.textMuted, fontSize: '13px' }}>{m.note}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ ...card, marginBottom: '14px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '17px', color: colors.text }}>Activities · votes</h2>
          {activities.map((a) => (
            <button
              key={a.title}
              type="button"
              onClick={openPaywall}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                border: 'none',
                borderBottom: `1px solid ${colors.border}`,
                background: 'none',
                color: colors.text,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              <span>{a.title}</span>
              <span style={{ color: colors.primary, fontWeight: '700', fontSize: '14px' }}>{a.votes} votes</span>
            </button>
          ))}
        </div>

        <div style={{ ...card, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', color: colors.text }}>Expenses</h2>
            <button
              type="button"
              onClick={openPaywall}
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: colors.primary,
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
              }}
            >
              + Add expense
            </button>
          </div>
          {expenses.map((e) => (
            <button
              key={e.label}
              type="button"
              onClick={openPaywall}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 0',
                border: 'none',
                borderBottom: `1px solid ${colors.border}`,
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ color: colors.text, fontWeight: '600' }}>{e.label} — {e.amount}</div>
              {e.split && <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '2px' }}>{e.split}</div>}
            </button>
          ))}
        </div>

        <div style={card}>
          <h2 style={{ margin: '0 0 12px', fontSize: '17px', color: colors.text }}>Itinerary</h2>
          {itinerary.map((line) => (
            <div key={line} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: '15px' }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div
        className="funnel-demo-sticky"
        style={{
          backgroundColor: `${colors.cardBg}f2`,
          borderTop: `1px solid ${colors.border}`,
          boxShadow: `0 -8px 28px ${colors.shadow}`,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/login?signup=true')}
          style={{
            flex: 1,
            padding: '14px 12px',
            fontSize: '15px',
            fontWeight: '800',
            backgroundColor: colors.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
          }}
        >
          Create My Trip
        </button>
        <button
          type="button"
          onClick={() => navigate('/ltd')}
          style={{
            flex: 1,
            padding: '14px 12px',
            fontSize: '14px',
            fontWeight: '700',
            backgroundColor: colors.backgroundTertiary,
            color: colors.text,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
          }}
        >
          Lifetime $49
        </button>
      </div>

      {pitchOpen && (
        <DemoPitchPopup onClose={() => setPitchOpen(false)} />
      )}
      {paywallOpen && (
        <FunnelPaywallModal
          onClose={() => setPaywallOpen(false)}
          onContinueFree={() => setPaywallOpen(false)}
        />
      )}
      {emailOpen && (
        <EmailCaptureModal onClose={() => setEmailOpen(false)} />
      )}
    </div>
  );
}

export default DemoTrip;
