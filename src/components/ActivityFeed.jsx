import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';

function ActivityFeed({ planId, members = [] }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { profiles } = useUserProfiles(members);

  useEffect(() => {
    if (!planId) return;

    // Real-time listener for activity logs
    const q = query(
      collection(db, 'activityLogs'),
      where('planId', '==', planId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(logsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to activity logs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [planId]);

  const getActivityIcon = (type) => {
    const icons = {
      task_created: '✅',
      task_completed: '🎉',
      task_uncompleted: '↩️',
      task_deleted: '🗑️',
      task_edited: '✏️',
      activity_created: '📅',
      activity_scheduled: '📆',
      activity_unscheduled: '📅',
      expense_added: '💰',
      expense_deleted: '💸',
      member_joined: '👋',
      member_left: '👤',
      member_removed: '❌',
      comment_added: '💬',
      vote_cast: '🗳️',
      plan_updated: '📝',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    if (type.includes('completed') || type.includes('joined')) return colors.success;
    if (type.includes('deleted') || type.includes('removed') || type.includes('left')) return colors.danger;
    if (type.includes('expense')) return colors.warning;
    if (type.includes('comment')) return colors.purple;
    return colors.primary;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted }}>
        Loading activity...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: colors.textMuted,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: '12px',
        border: `2px dashed ${colors.border}`,
      }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
        <p style={{ margin: 0 }}>No activity yet. Start adding tasks!</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: colors.cardBg,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.backgroundTertiary,
      }}>
        <h3 style={{ margin: 0, color: colors.text, fontSize: '16px' }}>
          Recent Activity
        </h3>
      </div>

      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        {activities.map((activity, index) => {
          const isCurrentUser = activity.userId === auth.currentUser?.uid;
          const userName = isCurrentUser
            ? 'You'
            : getUserDisplayName(activity.userId, profiles, auth.currentUser?.uid);

          return (
            <div
              key={activity.id}
              style={{
                padding: '12px 20px',
                borderBottom: index < activities.length - 1 ? `1px solid ${colors.border}` : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${getActivityColor(activity.type)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>
                {getActivityIcon(activity.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: colors.text,
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}>
                  <strong style={{ color: getActivityColor(activity.type) }}>
                    {userName}
                  </strong>{' '}
                  {activity.message}
                </div>
                {activity.details && (
                  <div style={{
                    color: colors.textMuted,
                    fontSize: '13px',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    "{activity.details}"
                  </div>
                )}
              </div>

              <div style={{
                color: colors.textMuted,
                fontSize: '12px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                {formatTimeAgo(activity.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityFeed;
