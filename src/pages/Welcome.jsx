import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#f44336',
  '#00BCD4', '#E91E63', '#673AB7', '#3F51B5', '#009688',
];

function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  );
  const navigate = useNavigate();
  const { colors } = useTheme();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Not logged in, redirect to login
        navigate('/login');
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const tutorialSteps = [
    {
      icon: '👋',
      title: 'Welcome to Travel Gang!',
      description: "We're excited to have you here. Let's take a quick tour of what you can do with your new planning companion.",
      tip: 'This will only take a minute!',
    },
    {
      icon: '📋',
      title: 'Create Plans',
      description: 'Start by creating a plan for your trip, event, or project. Give it a name, description, and set your dates.',
      tip: 'Pro tip: You can archive plans when they\'re complete to keep things tidy.',
    },
    {
      icon: '✅',
      title: 'Add Tasks & Activities',
      description: 'Break your plan into actionable tasks (to-dos) and scheduled activities. Set priorities, due dates, and assign them to team members.',
      tip: 'Tasks are simple to-dos. Activities are things you\'ll schedule on the calendar.',
    },
    {
      icon: '👥',
      title: 'Invite Your Team',
      description: 'Share your plan with friends, family, or colleagues. They can join using an invite link or QR code.',
      tip: 'As the plan creator, you\'re the admin and can manage members.',
    },
    {
      icon: '📅',
      title: 'Schedule & Vote',
      description: 'Propose dates and times for activities. Team members can vote on their preferences, and admins can approve to schedule.',
      tip: 'Scheduled activities appear on the calendar view!',
    },
    {
      icon: '💰',
      title: 'Track Expenses',
      description: 'Log expenses as you go. Split them evenly or customize who owes what. We\'ll calculate who owes whom at the end.',
      tip: 'Categories help you see where your money is going.',
    },
    {
      icon: '📊',
      title: 'View Analytics',
      description: 'Check the Analytics tab to see your progress, expense breakdowns, member contributions, and a timeline of activities.',
      tip: 'Great for staying on top of your plan!',
    },
    {
      icon: '🚀',
      title: "One Last Thing — Set Up Your Profile",
      description: "Tell your trip partners who you are. Pick a color and enter your name to get started.",
      tip: "You can update your profile anytime from the dashboard.",
      isProfileStep: true,
    },
  ];

  const handleComplete = async () => {
    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Please enter your name to continue');
      return;
    }

    setSaving(true);
    try {
      // Save user profile so Dashboard never shows the setup modal
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        avatarColor,
        email: user.email,
        phoneNumber: '',
        bio: '',
        favoriteDestinations: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mark tutorial completed
      await setDoc(doc(db, 'userProfiles', user.uid), {
        tutorialCompleted: true,
        tutorialCompletedAt: new Date(),
      }, { merge: true });

      toast.success('Welcome to Travel Gang!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Setup error, redirecting anyway...');
      window.location.href = '/dashboard';
    }
  };

  const handleSkip = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      // Save a minimal profile so the Dashboard modal never fires
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.email.split('@')[0],
        avatarColor: AVATAR_COLORS[0],
        email: user.email,
        phoneNumber: '',
        bio: '',
        favoriteDestinations: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await setDoc(doc(db, 'userProfiles', user.uid), {
        tutorialCompleted: true,
        tutorialSkipped: true,
      }, { merge: true });

      toast.success('Welcome to Travel Gang!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving profile:', error);
      window.location.href = '/dashboard';
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      transition: 'background-color 0.3s ease',
    }}>
      <div
        className="animate-scaleIn"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: colors.cardBg,
          borderRadius: '20px',
          boxShadow: `0 8px 32px ${colors.shadow}`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {saving && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${colors.cardBg}ee`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: '20px',
          }}>
            <LoadingSpinner size="large" text="Setting up your account..." />
          </div>
        )}

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          backgroundColor: colors.backgroundTertiary,
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
            backgroundColor: colors.primary,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: '48px 40px' }}>
          {/* Icon */}
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: `${colors.primary}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            margin: '0 auto 32px',
          }}>
            {step.icon}
          </div>

          {/* Title */}
          <h1 style={{
            color: colors.text,
            fontSize: '28px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            {step.title}
          </h1>

          {/* Description */}
          <p style={{
            color: colors.textSecondary,
            fontSize: '16px',
            textAlign: 'center',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            {step.description}
          </p>

          {/* Tip Box */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: `${colors.warning}15`,
            borderRadius: '12px',
            border: `1px solid ${colors.warning}30`,
            marginBottom: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: colors.warning,
              fontWeight: '600',
            }}>
              <span>💡</span>
              <span>{step.tip}</span>
            </div>
          </div>

          {/* Profile setup form — only on last step */}
          {step.isProfileStep && (
            <div style={{ marginBottom: '24px' }}>
              {/* Avatar preview + color picker */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  margin: '0 auto 12px',
                  transition: 'background-color 0.2s ease',
                }}>
                  {displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: avatarColor === color ? `3px solid ${colors.text}` : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Name input */}
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name (e.g. John Smith)"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '10px',
                  color: colors.text,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
            </div>
          )}

          {/* Step Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}>
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: index === currentStep ? '24px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: index <= currentStep ? colors.primary : colors.backgroundTertiary,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  backgroundColor: colors.backgroundTertiary,
                  color: colors.text,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                }}
              >
                Back
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                style={{
                  padding: '14px 40px',
                  fontSize: '16px',
                  backgroundColor: colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start Planning! 🚀
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  padding: '14px 40px',
                  fontSize: '16px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Skip Button */}
        {!isLastStep && (
          <div style={{
            padding: '0 40px 24px',
            textAlign: 'center',
          }}>
            <button
              onClick={handleSkip}
              disabled={saving}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textMuted,
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.textSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textMuted;
              }}
            >
              Skip tutorial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Welcome;
