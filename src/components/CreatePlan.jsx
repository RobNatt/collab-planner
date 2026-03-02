import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { trackTripCreated } from '../utils/analytics';
import { useTheme } from '../contexts/ThemeContext';
import { UpgradeModal } from './UpgradeModal';
import { ConfirmTripModal } from './ConfirmTripModal';
import { useLicense } from '../hooks/useLicense';
import { PLAN_TYPES } from '../data/pricingPlans';
import toast from 'react-hot-toast';

function CreatePlan({ onPlanCreated }) {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showConfirmTrip, setShowConfirmTrip] = useState(false);
  const { colors } = useTheme();
  const { hasUnlimitedAccess, planType } = useLicense(auth.currentUser?.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check trip duration gate for free users (4-day max unless paid plan)
    if (startDate && endDate && !hasUnlimitedAccess) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 4) {
        setShowUpgrade(true);
        return;
      }
    }

    // Pay-per-trip: show confirmation modal before charge
    if (planType === PLAN_TYPES.PAY_PER_TRIP) {
      setShowConfirmTrip(true);
      return;
    }

    setLoading(true);

    try {
      const planData = {
        name: planName,
        description: description,
        startDate: startDate,
        endDate: endDate,
        createdBy: auth.currentUser.uid,
        createdByEmail: auth.currentUser.email,
        members: [auth.currentUser.uid],
        admin: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'plans'), planData);
      const durationDays = startDate && endDate
        ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        : 0;
      trackTripCreated(planName, durationDays);
      toast.success('Plan created successfully!');

      setPlanName('');
      setDescription('');
      setStartDate('');
      setEndDate('');

      if (onPlanCreated) onPlanCreated();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Error creating plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTripSuccess = () => {
    setPlanName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    if (onPlanCreated) onPlanCreated();
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    color: colors.text,
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  return (
    <div
      className="animate-fadeIn"
      style={{
        backgroundColor: colors.backgroundTertiary,
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: `1px solid ${colors.border}`,
      }}
    >
      <h2 style={{ color: colors.text, marginBottom: '20px' }}>Create New Plan</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Plan Name (e.g., 'Summer Vacation 2025')"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = colors.inputFocus;
              e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '80px',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.inputFocus;
              e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.textSecondary,
              fontWeight: '500',
            }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = colors.inputFocus;
                e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.textSecondary,
              fontWeight: '500',
            }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = colors.inputFocus;
                e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 28px',
            fontSize: '16px',
            backgroundColor: loading ? colors.textMuted : colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading && (
            <div style={{
              width: 18,
              height: 18,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          {loading ? 'Creating Plan...' : 'Create Plan'}
        </button>
      </form>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showConfirmTrip && (
        <ConfirmTripModal
          tripData={{ planName, description, startDate, endDate }}
          onClose={() => setShowConfirmTrip(false)}
          onSuccess={handleConfirmTripSuccess}
        />
      )}
    </div>
  );
}

export default CreatePlan;
