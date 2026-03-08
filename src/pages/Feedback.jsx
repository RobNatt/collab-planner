import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProfile } from '../hooks/useUserProfile';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function Feedback() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile } = useUserProfile(user?.uid);

  const [activeTab, setActiveTab] = useState('review');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate('/login?redirect=/feedback');
      } else {
        setUser(u);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, 'feedback'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setMySubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        // Index may not exist yet
      }
      setLoadingSubs(false);
    };
    fetchSubmissions();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const feedbackData = {
        userId: user.uid,
        displayName: profile?.displayName || user.email,
        type: activeTab,
        title: title.trim(),
        description: description.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      };
      if (activeTab === 'review') {
        feedbackData.rating = rating;
      }

      await addDoc(collection(db, 'feedback'), feedbackData);
      toast.success('Thank you for your feedback!');
      setTitle('');
      setDescription('');
      setRating(5);

      // Refresh submissions list
      setMySubmissions(prev => [{ ...feedbackData, id: 'new', createdAt: { toDate: () => new Date() } }, ...prev]);
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  const tabs = [
    { id: 'review', label: 'Review', icon: '★' },
    { id: 'suggestion', label: 'Suggestion', icon: '💡' },
    { id: 'bug', label: 'Bug Report', icon: '🐛' },
  ];

  const typeColors = {
    review: colors.warning,
    suggestion: colors.primary,
    bug: colors.danger,
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

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
          onClick={() => navigate('/dashboard')}
          style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, cursor: 'pointer' }}
        >
          Travel Gang
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 24px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 40px 60px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Feedback
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: '32px' }}>
          Help us improve Travel Gang. Share reviews, suggest features, or report bugs.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeTab === tab.id ? `${typeColors[tab.id]}15` : 'transparent',
                color: activeTab === tab.id ? typeColors[tab.id] : colors.textSecondary,
                border: `1px solid ${activeTab === tab.id ? typeColors[tab.id] : colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: '28px',
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          marginBottom: '40px',
        }}>
          {activeTab === 'review' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500', fontSize: '14px' }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: star <= rating ? colors.warning : colors.border,
                      transition: 'color 0.15s ease',
                      padding: '2px',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500', fontSize: '14px' }}>
              {activeTab === 'review' ? 'Review Title' : activeTab === 'suggestion' ? 'Feature Title' : 'Bug Summary'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'review' ? 'e.g. Great for group trips!' : activeTab === 'suggestion' ? 'e.g. Add weather forecasts' : 'e.g. Calendar not loading on mobile'}
              required
              disabled={submitting}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = typeColors[activeTab]}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500', fontSize: '14px' }}>
              {activeTab === 'bug' ? 'Steps to Reproduce' : 'Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeTab === 'bug' ? '1. Go to...\n2. Click on...\n3. See error...' : 'Tell us more...'}
              required
              disabled={submitting}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => e.target.style.borderColor = typeColors[activeTab]}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: submitting ? colors.textMuted : typeColors[activeTab],
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        {/* Past Submissions */}
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Your Submissions
        </h2>
        {loadingSubs ? (
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        ) : mySubmissions.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>No submissions yet. Be the first to share your thoughts!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mySubmissions.map(sub => (
              <div key={sub.id} style={{
                padding: '16px',
                backgroundColor: colors.cardBg,
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: `${typeColors[sub.type] || colors.primary}15`,
                    color: typeColors[sub.type] || colors.primary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}>
                    {sub.type}
                  </span>
                  {sub.rating && (
                    <span style={{ color: colors.warning, fontSize: '13px' }}>
                      {'★'.repeat(sub.rating)}{'☆'.repeat(5 - sub.rating)}
                    </span>
                  )}
                  <span style={{ color: colors.textMuted, fontSize: '12px', marginLeft: 'auto' }}>
                    {sub.createdAt?.toDate ? sub.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <h4 style={{ color: colors.text, margin: '0 0 4px 0', fontSize: '15px' }}>{sub.title}</h4>
                <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{sub.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
