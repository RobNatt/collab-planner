/**
 * Static UI replicas for landing-page screenshots.
 * Not linked in nav — open /marketing-ui-mocks directly.
 */
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import ItineraryViewBody from '../components/ItineraryViewBody';
import { getUserDisplayName } from '../utils/userHelpers';

const MEMBERS = {
  alex: 'Alex',
  jess: 'Jess',
  mike: 'Mike',
  sam: 'Sam',
  riley: 'Riley',
  chris: 'Chris',
};

const profiles = Object.fromEntries(
  Object.entries(MEMBERS).map(([id, name]) => [id, { displayName: name }])
);

const MOCK_PLAN = {
  id: 'mock',
  name: 'Miami Weekend 🌴',
  startDate: '2026-05-15',
  endDate: '2026-05-18',
  members: ['alex', 'jess', 'mike', 'sam', 'riley'],
  admin: 'alex',
};

/** 7 activities + 10 tasks — aligned with expenses & itinerary */
const MOCK_ACTIVITIES = [
  {
    id: 'a1',
    type: 'activity',
    title: 'Hotel check-in (South Beach)',
    completed: true,
    priority: 'high',
    assignedTo: 'alex',
    scheduledDate: '2026-05-15',
    scheduledTime: '15:00',
    dateTimeSuggestions: [
      { date: '2026-05-15', time: '15:00', userId: 'alex', votes: ['alex', 'jess', 'mike', 'sam'] },
      { date: '2026-05-15', time: '16:30', userId: 'riley', votes: ['riley'] },
    ],
  },
  {
    id: 'a2',
    type: 'activity',
    title: 'South Beach brunch — Orange Blossom',
    completed: false,
    priority: 'medium',
    assignedTo: 'jess',
    scheduledDate: '2026-05-16',
    scheduledTime: '10:30',
    dateTimeSuggestions: [
      { date: '2026-05-16', time: '10:30', userId: 'jess', votes: ['jess', 'mike', 'sam', 'riley', 'alex'] },
      { date: '2026-05-16', time: '11:00', userId: 'mike', votes: ['mike'] },
    ],
  },
  {
    id: 'a3',
    type: 'activity',
    title: 'Wynwood murals & coffee',
    completed: false,
    priority: 'low',
    assignedTo: 'sam',
    scheduledDate: '2026-05-16',
    scheduledTime: '14:00',
    dateTimeSuggestions: [
      { date: '2026-05-16', time: '14:00', userId: 'sam', votes: ['sam', 'alex', 'jess', 'mike'] },
      { date: '2026-05-16', time: '15:30', userId: 'riley', votes: ['riley', 'alex'] },
    ],
  },
  {
    id: 'a4',
    type: 'activity',
    title: "Joe's Stone Crab — group dinner",
    completed: false,
    priority: 'high',
    assignedTo: 'alex',
    scheduledDate: '2026-05-16',
    scheduledTime: '20:00',
    dateTimeSuggestions: [
      { date: '2026-05-16', time: '20:00', userId: 'alex', votes: ['alex', 'jess', 'mike', 'sam', 'riley'] },
      { date: '2026-05-16', time: '19:00', userId: 'jess', votes: ['jess'] },
    ],
  },
  {
    id: 'a5',
    type: 'activity',
    title: 'Little Havana food walk',
    completed: false,
    priority: 'medium',
    assignedTo: 'mike',
    scheduledDate: '2026-05-17',
    scheduledTime: '11:00',
    dateTimeSuggestions: [
      { date: '2026-05-17', time: '11:00', userId: 'mike', votes: ['mike', 'sam', 'riley', 'alex', 'jess'] },
    ],
  },
  {
    id: 'a6',
    type: 'activity',
    title: 'Sunset cruise — Biscayne Bay',
    completed: false,
    priority: 'high',
    assignedTo: 'jess',
    scheduledDate: '2026-05-17',
    scheduledTime: '18:30',
    dateTimeSuggestions: [
      { date: '2026-05-17', time: '18:30', userId: 'jess', votes: ['jess', 'alex', 'mike', 'sam', 'riley', 'chris'] },
      { date: '2026-05-17', time: '17:45', userId: 'sam', votes: ['sam'] },
    ],
  },
  {
    id: 'a7',
    type: 'activity',
    title: 'Farewell brunch — Collins Ave',
    completed: false,
    priority: 'low',
    assignedTo: 'riley',
    scheduledDate: '2026-05-18',
    scheduledTime: '10:00',
    dateTimeSuggestions: [
      { date: '2026-05-18', time: '10:00', userId: 'riley', votes: ['riley', 'alex', 'jess', 'mike'] },
      { date: '2026-05-18', time: '09:00', userId: 'sam', votes: ['sam'] },
    ],
  },
];

const MOCK_TASKS = [
  { id: 't1', type: 'task', title: 'Book Airbnb — Ocean Dr block', completed: true, priority: 'high', dueDate: '2026-05-08', assignedTo: 'alex' },
  { id: 't2', type: 'task', title: 'Download offline maps (Maps.me)', completed: true, priority: 'low', dueDate: '2026-05-14', assignedTo: 'jess' },
  { id: 't3', type: 'task', title: 'Confirm sunset cruise headcount & deposit', completed: false, priority: 'high', dueDate: '2026-05-12', assignedTo: 'jess' },
  { id: 't4', type: 'task', title: 'Pack sunscreen + portable charger', completed: false, priority: 'medium', dueDate: '2026-05-14', assignedTo: 'mike' },
  { id: 't5', type: 'task', title: 'Venmo Alex for Airbnb split', completed: false, priority: 'high', dueDate: '2026-05-10', assignedTo: 'sam' },
  { id: 't6', type: 'task', title: "Print Joe's reservation QR", completed: false, priority: 'medium', dueDate: '2026-05-15', assignedTo: 'alex' },
  { id: 't7', type: 'task', title: 'Passport / ID check for Riley', completed: true, priority: 'high', dueDate: '2026-05-01', assignedTo: 'riley' },
  { id: 't8', type: 'task', title: 'Shared Spotify playlist — road trip', completed: false, priority: 'low', dueDate: '2026-05-13', assignedTo: 'sam' },
  { id: 't9', type: 'task', title: 'Order mini cooler for beach day', completed: false, priority: 'low', dueDate: '2026-05-11', assignedTo: 'mike' },
  { id: 't10', type: 'task', title: 'Screenshot boarding passes to album', completed: false, priority: 'medium', dueDate: '2026-05-14', assignedTo: 'jess' },
];

const MOCK_EXPENSES = [
  { id: 'e1', description: 'Airbnb — 4 nights South Beach', amount: 2400, category: 'lodging', paidBy: 'alex', splitType: 'even', date: '2026-05-08' },
  { id: 'e2', description: 'Sunset cruise deposit', amount: 600, category: 'activities', paidBy: 'jess', splitType: 'even', date: '2026-05-12' },
  { id: 'e3', description: "Joe's Stone Crab dinner", amount: 340, category: 'food', paidBy: 'alex', splitType: 'even', date: '2026-05-16' },
  { id: 'e4', description: 'Wynwood guided tour tickets', amount: 180, category: 'activities', paidBy: 'sam', splitType: 'even', date: '2026-05-16' },
  { id: 'e5', description: 'Orange Blossom brunch', amount: 192, category: 'food', paidBy: 'jess', splitType: 'even', date: '2026-05-16' },
  { id: 'e6', description: 'Airport Uber (group)', amount: 58, category: 'transport', paidBy: 'mike', splitType: 'even', date: '2026-05-15' },
];

const PENDING_APPROVALS = [
  { id: 'p1', name: 'Taylor K.', email: 'taylor.k@email.com', amountCents: 100 },
  { id: 'p2', name: 'Jordan Lee', email: 'jordan.lee@email.com', amountCents: 100 },
  { id: 'p3', name: 'Casey Morgan', email: 'casey.m@email.com', amountCents: 100 },
  { id: 'p4', name: 'Riley Chen', email: 'riley.chen@email.com', amountCents: 100 },
];

function MockInviteSection({ colors }) {
  const inviteCode = 'MIAMIDEMO';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div style={{
      backgroundColor: `${colors.primary}10`,
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${colors.primary}30`,
    }}
    >
      <h3 style={{ marginTop: 0, color: colors.text }}>Invite Members</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 12px',
          backgroundColor: colors.successLight,
          color: colors.success,
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
        }}
        >
          Active
        </span>
        <span style={{
          padding: '4px 12px',
          backgroundColor: colors.backgroundTertiary,
          color: colors.textMuted,
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
        }}
        >
          Expires in 5d 12h
        </span>
        <span style={{
          padding: '4px 12px',
          backgroundColor: colors.backgroundTertiary,
          color: colors.textMuted,
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
        }}
        >
          2/25 uses
        </span>
      </div>
      <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '12px' }}>
        Share this link or QR code to invite others:
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <code style={{
          flex: 1,
          minWidth: '200px',
          padding: '10px 14px',
          backgroundColor: colors.inputBg,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: '13px',
          wordBreak: 'break-all',
        }}
        >
          {origin}/invite/{inviteCode}
        </code>
        <button
          type="button"
          style={{
            padding: '10px 20px',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          Copy
        </button>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{
          padding: '8px 16px',
          backgroundColor: colors.deepPurple,
          color: 'white',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
        }}
        >
          Show QR
        </span>
        <span style={{
          padding: '8px 16px',
          backgroundColor: colors.backgroundTertiary,
          color: colors.textSecondary,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
        }}
        >
          Settings
        </span>
        <span style={{
          padding: '8px 16px',
          backgroundColor: colors.warning,
          color: 'white',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
        }}
        >
          Regenerate
        </span>
      </div>

      <div style={{
        marginTop: '18px',
        padding: '16px',
        borderRadius: '10px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.cardBg,
      }}
      >
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          Pending collaborator approvals
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PENDING_APPROVALS.map((req) => (
            <div
              key={req.id}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                gap: '8px',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: '180px' }}>
                <div style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                  {req.name}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                  {req.email} · Requested access. Fee: ${(req.amountCents / 100).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: colors.success,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {`Accept payment for ${req.name.split(' ')[0]}`}
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent',
                    color: colors.textSecondary,
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockActivityCard({ activity, colors }) {
  const isTask = activity.type === 'task';
  const accentColor = isTask ? colors.primary : colors.warning;
  const suggestions = activity.dateTimeSuggestions || [];
  const isScheduled = activity.scheduledDate;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: colors.cardBg,
        border: `2px solid ${accentColor}40`,
        borderLeft: `6px solid ${accentColor}`,
        borderRadius: '12px',
        boxShadow: `0 2px 8px ${colors.shadow}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input type="checkbox" checked={activity.completed} readOnly style={{ width: '22px', height: '22px', accentColor }} />
        <div style={{ flex: 1 }}>
          <span style={{
            textDecoration: activity.completed ? 'line-through' : 'none',
            color: activity.completed ? colors.textMuted : colors.text,
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: '1.35',
          }}
          >
            {activity.title}
          </span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
              backgroundColor: activity.priority === 'high' ? colors.dangerLight : activity.priority === 'low' ? colors.successLight : colors.warningLight,
              color: activity.priority === 'high' ? colors.danger : activity.priority === 'low' ? colors.success : colors.warning,
            }}
            >
              {(activity.priority || 'medium').toUpperCase()}
            </span>
            {activity.dueDate && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: colors.backgroundTertiary,
                color: colors.textSecondary,
              }}
              >
                📅 {activity.dueDate}
              </span>
            )}
            {activity.assignedTo && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: colors.purpleLight,
                color: colors.purple,
              }}
              >
                👤 {getUserDisplayName(activity.assignedTo, profiles, null)}
              </span>
            )}
          </div>
        </div>
        <button type="button" style={{ padding: '8px 16px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>Edit</button>
        <button type="button" style={{ padding: '8px 16px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>Delete</button>
        <button type="button" style={{ padding: '8px 16px', backgroundColor: colors.backgroundTertiary, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>💬 Comments</button>
      </div>

      {!isTask && (
        <div style={{ marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
          {isScheduled && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              padding: '12px',
              backgroundColor: colors.successLight,
              borderRadius: '8px',
              border: `1px solid ${colors.success}`,
            }}
            >
              <span style={{ fontSize: '20px' }}>📅</span>
              <div style={{ flex: 1, color: colors.text }}>
                <strong>Scheduled:</strong> {activity.scheduledDate}
                {activity.scheduledTime && ` at ${activity.scheduledTime}`}
              </div>
            </div>
          )}
          <button
            type="button"
            style={{
              padding: '10px 16px',
              backgroundColor: colors.purple,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              width: '100%',
              fontSize: '14px',
            }}
          >
            ▼ Date/Time Suggestions ({suggestions.length})
          </button>
          <div style={{
            marginTop: '15px',
            padding: '16px',
            backgroundColor: colors.purpleLight,
            borderRadius: '12px',
          }}
          >
            <h4 style={{ marginTop: 0, marginBottom: '12px', color: colors.text }}>Suggestions &amp; Votes</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((suggestion, index) => {
                const voteCount = suggestion.votes?.length || 0;
                return (
                  <div
                    key={index}
                    style={{
                      padding: '14px',
                      backgroundColor: colors.cardBg,
                      borderRadius: '10px',
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: colors.text }}>
                        📅 {suggestion.date}
                        {suggestion.time && ` ⏰ ${suggestion.time}`}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        Suggested by: {getUserDisplayName(suggestion.userId, profiles, null)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        style={{
                          padding: '8px 14px',
                          backgroundColor: colors.backgroundTertiary,
                          color: colors.text,
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        + {voteCount}
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '8px 14px',
                          backgroundColor: colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MockExpensesBlock({ colors }) {
  const categoryIcons = {
    food: '🍔',
    lodging: '🏨',
    transport: '🚗',
    activities: '🎯',
    shopping: '🛍️',
    other: '📦',
  };

  const settlements = [
    { from: 'mike', to: 'alex', amount: 124.4 },
    { from: 'sam', to: 'jess', amount: 88.2 },
    { from: 'riley', to: 'alex', amount: 56.0 },
  ];

  const total = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, color: colors.text }}>Expense Tracking</h2>
        <button
          type="button"
          style={{
            padding: '12px 24px',
            backgroundColor: colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Show Expenses ({MOCK_EXPENSES.length})
        </button>
      </div>

      <button
        type="button"
        style={{
          padding: '14px 24px',
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '20px',
          width: '100%',
        }}
      >
        + Add Expense
      </button>

      <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '16px', lineHeight: 1.5 }}>
        Expenses below tie to your trip: Airbnb &amp; cruise match <strong style={{ color: colors.text }}>tasks</strong>; dinners &amp; tours match <strong style={{ color: colors.text }}>scheduled activities</strong> from Tasks &amp; Activities.
      </p>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: colors.text }}>All Expenses</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {MOCK_EXPENSES.map((expense) => (
            <div
              key={expense.id}
              style={{
                padding: '20px',
                backgroundColor: colors.cardBg,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                boxShadow: `0 2px 8px ${colors.shadow}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{categoryIcons[expense.category]}</span>
                    <h4 style={{ margin: 0, color: colors.text }}>{expense.description}</h4>
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '20px', color: colors.success }}>
                      ${expense.amount.toFixed(2)}
                    </strong>
                    {' • '}
                    Paid by: {getUserDisplayName(expense.paidBy, profiles, null)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>
                    Split: Evenly among all · {expense.date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={{ padding: '8px 16px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>Edit</button>
                  <button type="button" style={{ padding: '8px 16px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: colors.warningLight,
        padding: '25px',
        borderRadius: '12px',
        border: `2px solid ${colors.warning}`,
      }}
      >
        <h3 style={{ marginTop: 0, color: colors.text }}>Who Owes Whom</h3>
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: colors.cardBg,
          borderRadius: '10px',
        }}
        >
          <strong style={{ color: colors.text }}>Total Trip Expenses: ${total.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settlements.map((s, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: colors.cardBg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                border: `1px solid ${colors.border}`,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, color: colors.text }}>
                <strong>{getUserDisplayName(s.from, profiles, null)}</strong>
                {' owes '}
                <strong>{getUserDisplayName(s.to, profiles, null)}</strong>
              </div>
              <div style={{
                padding: '10px 20px',
                backgroundColor: colors.success,
                color: 'white',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
              >
                ${s.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: colors.cardBg,
          borderRadius: '10px',
          fontSize: '14px',
          color: colors.textSecondary,
        }}
        >
          💡 Tip: These settlements are optimized to minimize the number of transactions needed.
        </div>
      </div>
    </div>
  );
}

function SectionFrame({ title, hint, children, colors }) {
  return (
    <div style={{ marginBottom: '56px' }}>
      <div style={{
        padding: '12px 16px',
        backgroundColor: colors.backgroundTertiary,
        borderRadius: '10px',
        border: `1px solid ${colors.border}`,
        marginBottom: '16px',
      }}
      >
        <h2 style={{ margin: 0, color: colors.text, fontSize: '18px' }}>{title}</h2>
        {hint && <p style={{ margin: '8px 0 0', fontSize: '13px', color: colors.textMuted }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function MarketingUiMocks() {
  const { colors } = useTheme();
  const allItems = [...MOCK_ACTIVITIES, ...MOCK_TASKS];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '24px 16px 80px',
    }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', color: colors.text, fontSize: '24px' }}>Marketing UI mocks</h1>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '14px', maxWidth: '640px', lineHeight: 1.5 }}>
              Screenshot each block below for the landing page. Uses the same styles as Plan Details (Invite, Tasks &amp; Activities, Expenses, Itinerary). Open while{' '}
              <code style={{ fontSize: '12px', color: colors.primary }}>npm run dev</code>
              {' '}is running:{' '}
              <code style={{ fontSize: '12px', color: colors.primary }}>/marketing-ui-mocks</code>
              {' '}or{' '}
              <code style={{ fontSize: '12px', color: colors.primary }}>/ui-mocks</code>
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div style={{
          padding: '32px',
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
        }}
        >
          {/* Fake plan header + Invite tab strip */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ margin: '0 0 6px', color: colors.text, fontSize: '26px' }}>{MOCK_PLAN.name}</h1>
            <p style={{ color: colors.textMuted, margin: 0 }}>📅 {MOCK_PLAN.startDate} to {MOCK_PLAN.endDate}</p>
          </div>
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '24px',
            borderBottom: `3px solid ${colors.border}`,
            overflowX: 'auto',
          }}
          >
            {[
              { id: 'invite', label: 'Invite' },
              { id: 'members', label: 'Directory' },
              { id: 'tasks', label: 'Tasks & Activities' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'itinerary', label: 'Itinerary' },
            ].map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                style={{
                  padding: '15px 25px',
                  backgroundColor: tab.id === 'invite' ? colors.cardBg : 'transparent',
                  color: tab.id === 'invite' ? colors.primary : colors.textSecondary,
                  border: 'none',
                  borderBottom: tab.id === 'invite' ? `3px solid ${colors.primary}` : '3px solid transparent',
                  fontWeight: tab.id === 'invite' ? 'bold' : 'normal',
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                  marginBottom: '-3px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <SectionFrame
            colors={colors}
            title="1 · Invite tab — pending collaborator approvals (×4)"
            hint="Replica of Invite Members + pending approval cards. Capture full width."
          >
            <MockInviteSection colors={colors} />
          </SectionFrame>

          <SectionFrame
            colors={colors}
            title="2 · Tasks & Activities — 7 activities + 10 tasks"
            hint="Same card chrome as plan details. Activities show scheduled row + suggestions & votes."
          >
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '0',
            }}
            >
              <div style={{
                padding: '12px 24px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderBottom: `3px solid ${colors.primary}`,
                fontWeight: 'bold',
                fontSize: '16px',
              }}
              >
                ✓ Simple Tasks ({MOCK_TASKS.length})
              </div>
              <div style={{
                padding: '12px 24px',
                backgroundColor: colors.warning,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                borderBottom: `3px solid ${colors.warning}`,
              }}
              >
                Activities ({MOCK_ACTIVITIES.length})
              </div>
            </div>

            <h3 style={{ color: colors.text, margin: '0 0 12px' }}>Activities ({MOCK_ACTIVITIES.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {MOCK_ACTIVITIES.map((a) => (
                <MockActivityCard key={a.id} activity={a} colors={colors} />
              ))}
            </div>

            <h3 style={{ color: colors.text, margin: '0 0 12px' }}>✓ Simple Tasks ({MOCK_TASKS.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_TASKS.map((t) => (
                <MockActivityCard key={t.id} activity={t} colors={colors} />
              ))}
            </div>
          </SectionFrame>

          <SectionFrame
            colors={colors}
            title="3 · Expenses — tied to trip items above"
            hint="Lodging = Airbnb task; activities = cruise, Joe’s, Wynwood, brunch; transport = airport ride."
          >
            <MockExpensesBlock colors={colors} />
          </SectionFrame>

          <SectionFrame
            colors={colors}
            title="4 · Shared itinerary (same UI as plan Itinerary tab)"
            hint="Uses ItineraryViewBody — identical markup/styles as live ItineraryView, with static member names (no Firebase)."
          >
            <ItineraryViewBody
              plan={MOCK_PLAN}
              activities={allItems}
              expenses={MOCK_EXPENSES}
              profiles={profiles}
              viewerUserId={null}
            />
          </SectionFrame>
        </div>
      </div>
    </div>
  );
}
