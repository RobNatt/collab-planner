import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';
import { useTheme } from '../contexts/ThemeContext';
import { SkeletonCard } from '../components/Skeleton';

function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { colors } = useTheme();

  const adminIds = [...new Set(plans.map(plan => plan.admin).filter(Boolean))];
  const { profiles } = useUserProfiles(adminIds);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const q = query(
        collection(db, 'plans'),
        where('members', 'array-contains', auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const plansData = await Promise.all(
        querySnapshot.docs.map(async (planDoc) => {
          const planId = planDoc.id;

          const activitiesQuery = query(
            collection(db, 'activities'),
            where('planId', '==', planId)
          );
          const activitiesSnapshot = await getDocs(activitiesQuery);

          const totalTasks = activitiesSnapshot.size;
          const completedTasks = activitiesSnapshot.docs.filter(
            doc => doc.data().completed
          ).length;

          return {
            id: planId,
            ...planDoc.data(),
            totalTasks,
            completedTasks
          };
        })
      );

      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 style={{ color: colors.text, marginBottom: '16px' }}>Your Plans</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: colors.textSecondary,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: '12px',
        border: `2px dashed ${colors.border}`,
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ fontSize: '18px', margin: 0 }}>No plans yet. Create your first plan above!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '16px' }}>Your Plans</h2>
      <div className="animate-stagger" style={{ display: 'grid', gap: '15px' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            onClick={() => navigate(`/plan/${plan.id}`)}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: colors.cardBg,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.shadowHover}`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '8px', color: colors.text }}>{plan.name}</h3>
            {plan.description && (
              <p style={{ color: colors.textSecondary, marginBottom: '12px' }}>{plan.description}</p>
            )}
            <div style={{ fontSize: '14px', color: colors.textMuted }}>
              <div style={{ marginBottom: '4px' }}>📅 {plan.startDate} to {plan.endDate}</div>
              <div style={{ marginBottom: '8px' }}>👥 {plan.members?.length || 1} member(s)</div>
              <div style={{
                marginTop: '8px',
                padding: '10px 12px',
                backgroundColor: colors.backgroundTertiary,
                borderRadius: '8px',
                fontWeight: '600',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: colors.success,
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '12px',
                }}>✓</span>
                {plan.completedTasks || 0}/{plan.totalTasks || 0} tasks complete
              </div>
              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <span style={{ color: colors.textSecondary }}>
                  Created by: {getUserDisplayName(plan.admin, profiles, auth.currentUser.uid)}
                </span>
                {plan.admin === auth.currentUser.uid && (
                  <span style={{
                    backgroundColor: colors.success,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    YOU'RE ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlansList;
