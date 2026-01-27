import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
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
      title: 'Welcome to Collab Planner!',
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
      title: "You're All Set!",
      description: "That's everything you need to know to get started. Create your first plan and start collaborating!",
      tip: "Let's go!",
    },
  ];

  const handleComplete = async () => {
    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      // Mark tutorial as completed in user profile
      await setDoc(doc(db, 'userProfiles', user.uid), {
        tutorialCompleted: true,
        tutorialCompletedAt: new Date(),
      }, { merge: true });

      toast.success('Welcome to Collab Planner!');
      // Use window.location for more reliable navigation
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving tutorial status:', error);
      toast.error('Setup error, redirecting anyway...');
      // Still navigate to dashboard even if saving fails
      window.location.href = '/dashboard';
    }
  };

  const handleSkip = async () => {
    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), {
        tutorialCompleted: true,
        tutorialSkipped: true,
      }, { merge: true });

      toast.success('Welcome to Collab Planner!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving tutorial status:', error);
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
