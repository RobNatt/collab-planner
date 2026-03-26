import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

function DemoTrip() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const demoTasks = [
    { title: 'Book flights', status: 'Done', owner: 'Alex' },
    { title: 'Reserve hotel', status: 'In progress', owner: 'Jordan' },
    { title: 'Build day-by-day itinerary', status: 'Todo', owner: 'Sam' },
  ];
  const demoActivities = [
    { title: 'City walking tour', when: 'Mar 17 · 10:00 AM' },
    { title: 'Group dinner', when: 'Mar 17 · 7:30 PM' },
  ];
  const demoExpenses = [
    { item: 'Hotel', amount: '$840', split: '$140 each' },
    { item: 'Museum passes', amount: '$180', split: '$30 each' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto 20px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundTertiary,
            color: colors.text,
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Back
        </button>
        <ThemeToggle />
      </div>

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: `0 6px 20px ${colors.shadow}`,
      }}>
        <h1 style={{ marginTop: 0, color: colors.text }}>Demo Trip Workspace</h1>
        <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>
          This is a quick look at how Collab Planner organizes tasks, activities, and shared expenses in one place.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px' }}>
            <h3 style={{ marginTop: 0, color: colors.text }}>Tasks</h3>
            {demoTasks.map((t) => (
              <div key={t.title} style={{ marginBottom: '10px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>{t.title}</strong><br />
                {t.status} · {t.owner}
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px' }}>
            <h3 style={{ marginTop: 0, color: colors.text }}>Activities</h3>
            {demoActivities.map((a) => (
              <div key={a.title} style={{ marginBottom: '10px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>{a.title}</strong><br />
                {a.when}
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px' }}>
            <h3 style={{ marginTop: 0, color: colors.text }}>Shared Expenses</h3>
            {demoExpenses.map((e) => (
              <div key={e.item} style={{ marginBottom: '10px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>{e.item}</strong><br />
                {e.amount} · {e.split}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '22px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: colors.primary,
              color: 'white',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            Create free account
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.text,
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoTrip;
