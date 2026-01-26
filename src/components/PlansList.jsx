import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';
import { useTheme } from '../contexts/ThemeContext';
import { SkeletonCard } from '../components/Skeleton';
import toast from 'react-hot-toast';

function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'upcoming', 'past', 'admin'
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();
  const { colors } = useTheme();

  const adminIds = [...new Set(plans.map(plan => plan.admin).filter(Boolean))];
  const { profiles } = useUserProfiles(adminIds);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleArchivePlan = async (e, plan) => {
    e.stopPropagation();

    try {
      await updateDoc(doc(db, 'plans', plan.id), {
        archived: !plan.archived
      });
      toast.success(plan.archived ? 'Plan unarchived!' : 'Plan archived!');
      fetchPlans();
    } catch (error) {
      console.error('Error archiving plan:', error);
      toast.error('Failed to archive plan');
    }
  };

  const handleDuplicatePlan = async (e, plan) => {
    e.stopPropagation(); // Prevent navigating to plan

    try {
      const newPlan = {
        name: `${plan.name} (Copy)`,
        description: plan.description || '',
        startDate: plan.startDate,
        endDate: plan.endDate,
        createdBy: auth.currentUser.uid,
        createdByEmail: auth.currentUser.email,
        members: [auth.currentUser.uid],
        admin: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'plans'), newPlan);
      toast.success('Plan duplicated!');
      navigate(`/plan/${docRef.id}`);
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast.error('Failed to duplicate plan');
    }
  };

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

  const filteredPlans = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return plans.filter(plan => {
      // Archive filter
      if (!showArchived && plan.archived) return false;
      if (filterType === 'archived') return plan.archived;

      // Search filter
      const matchesSearch = searchQuery === '' ||
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Type filter
      switch (filterType) {
        case 'upcoming':
          return plan.startDate >= today && !plan.archived;
        case 'past':
          return plan.endDate < today && !plan.archived;
        case 'active':
          return plan.startDate <= today && plan.endDate >= today && !plan.archived;
        case 'admin':
          return plan.admin === auth.currentUser.uid && !plan.archived;
        default:
          return !plan.archived;
      }
    });
  }, [plans, searchQuery, filterType, showArchived]);

  const archivedCount = plans.filter(p => p.archived).length;

  const filterButtons = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'admin', label: 'My Plans' },
    { id: 'archived', label: archivedCount > 0 ? `Archived (${archivedCount})` : 'Archived' },
  ];

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

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h2 style={{ color: colors.text, margin: 0 }}>Your Plans</h2>
        <span style={{
          color: colors.textMuted,
          fontSize: '14px',
        }}>
          {filteredPlans.length} of {plans.length} plans
        </span>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textMuted,
            fontSize: '18px',
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search plans by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              fontSize: '15px',
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '10px',
              color: colors.text,
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: colors.backgroundTertiary,
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {filterButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: filterType === btn.id ? '600' : '400',
                backgroundColor: filterType === btn.id ? colors.primary : colors.backgroundTertiary,
                color: filterType === btn.id ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (filterType !== btn.id) {
                  e.currentTarget.style.backgroundColor = colors.border;
                }
              }}
              onMouseLeave={(e) => {
                if (filterType !== btn.id) {
                  e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                }
              }}
            >
              {btn.label}
            </button>
          ))}
          {archivedCount > 0 && filterType !== 'archived' && (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '12px',
              fontSize: '14px',
              color: colors.textSecondary,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show archived
            </label>
          )}
        </div>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
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
      ) : filteredPlans.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: colors.textSecondary,
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '12px',
          border: `2px dashed ${colors.border}`,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '18px', margin: 0 }}>No plans match your search or filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="animate-stagger" style={{ display: 'grid', gap: '15px' }}>
          {filteredPlans.map(plan => {
            const today = new Date().toISOString().split('T')[0];
            const isActive = plan.startDate <= today && plan.endDate >= today;
            const isPast = plan.endDate < today;
            const isUpcoming = plan.startDate > today;

            return (
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
                  opacity: isPast ? 0.7 : 1,
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 0, color: colors.text }}>{plan.name}</h3>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {isActive && (
                      <span style={{
                        backgroundColor: colors.success,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        ACTIVE
                      </span>
                    )}
                    {isUpcoming && (
                      <span style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        UPCOMING
                      </span>
                    )}
                    {isPast && !plan.archived && (
                      <span style={{
                        backgroundColor: colors.textMuted,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        PAST
                      </span>
                    )}
                    {plan.archived && (
                      <span style={{
                        backgroundColor: colors.warning,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        ARCHIVED
                      </span>
                    )}
                  </div>
                </div>
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
                      backgroundColor: plan.totalTasks > 0 && plan.completedTasks === plan.totalTasks
                        ? colors.success
                        : colors.primary,
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                    }}>✓</span>
                    {plan.completedTasks || 0}/{plan.totalTasks || 0} tasks complete
                    {plan.totalTasks > 0 && (
                      <div style={{
                        flex: 1,
                        height: '6px',
                        backgroundColor: colors.border,
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginLeft: '8px',
                      }}>
                        <div style={{
                          width: `${(plan.completedTasks / plan.totalTasks) * 100}%`,
                          height: '100%',
                          backgroundColor: plan.completedTasks === plan.totalTasks
                            ? colors.success
                            : colors.primary,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    )}
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
                    <button
                      onClick={(e) => handleDuplicatePlan(e, plan)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: colors.backgroundTertiary,
                        color: colors.textSecondary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary;
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = colors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                        e.currentTarget.style.color = colors.textSecondary;
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => handleArchivePlan(e, plan)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: plan.archived ? colors.warningLight : colors.backgroundTertiary,
                        color: plan.archived ? colors.warning : colors.textSecondary,
                        border: `1px solid ${plan.archived ? colors.warning : colors.border}`,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.warning;
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = colors.warning;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = plan.archived ? colors.warningLight : colors.backgroundTertiary;
                        e.currentTarget.style.color = plan.archived ? colors.warning : colors.textSecondary;
                        e.currentTarget.style.borderColor = plan.archived ? colors.warning : colors.border;
                      }}
                    >
                      {plan.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlansList;
