import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';
import { auth } from '../config/firebase';

function ItineraryView({ plan, activities, expenses }) {
  const { colors } = useTheme();
  const { profiles } = useUserProfiles(plan?.members || []);

  const itinerary = useMemo(() => {
    if (!plan?.startDate || !plan?.endDate) return [];

    const days = [];
    const current = new Date(plan.startDate + 'T00:00:00');
    const endDate = new Date(plan.endDate + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];

    let dayNum = 1;
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];

      const dayActivities = activities
        .filter(a => a.scheduledDate === dateStr)
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

      const dayTasks = activities
        .filter(a => a.dueDate === dateStr && !a.scheduledDate)
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });

      const dayExpenses = expenses
        .filter(e => e.date === dateStr);

      days.push({
        date: dateStr,
        dayNumber: dayNum,
        dayOfWeek: current.toLocaleDateString('en-US', { weekday: 'long' }),
        monthDay: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        isToday: dateStr === today,
        isPast: dateStr < today,
        activities: dayActivities,
        tasks: dayTasks,
        expenses: dayExpenses,
        hasContent: dayActivities.length > 0 || dayTasks.length > 0,
      });

      current.setDate(current.getDate() + 1);
      dayNum++;
    }

    return days;
  }, [plan, activities, expenses]);

  const totalDays = itinerary.length;
  const daysWithContent = itinerary.filter(d => d.hasContent).length;
  const scheduledCount = activities.filter(a => a.scheduledDate).length;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: colors.dangerLight, color: colors.danger, label: 'High' };
      case 'low':
        return { bg: colors.successLight, color: colors.success, label: 'Low' };
      default:
        return { bg: colors.warningLight, color: colors.warning, label: 'Med' };
    }
  };

  if (!plan?.startDate || !plan?.endDate) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.textMuted,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: '12px',
        border: `2px dashed ${colors.border}`,
      }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
        <p style={{ margin: 0 }}>Set trip dates to view the itinerary.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '8px' }}>Itinerary</h2>
      <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
        Day-by-day schedule for your trip. {scheduledCount} activities scheduled across {daysWithContent} of {totalDays} days.
      </p>

      {/* Progress Overview */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          flex: '1 1 200px',
          padding: '16px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ color: colors.textMuted, fontSize: '13px' }}>Trip Coverage</span>
            <span style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>
              {totalDays > 0 ? Math.round((daysWithContent / totalDays) * 100) : 0}%
            </span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: colors.border,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${totalDays > 0 ? (daysWithContent / totalDays) * 100 : 0}%`,
              height: '100%',
              backgroundColor: colors.primary,
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Day-by-Day Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: colors.border,
        }} />

        {itinerary.map((day) => (
          <div
            key={day.date}
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '8px',
              position: 'relative',
            }}
          >
            {/* Timeline dot */}
            <div style={{
              width: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
              zIndex: 1,
            }}>
              <div style={{
                width: day.isToday ? '16px' : day.hasContent ? '12px' : '8px',
                height: day.isToday ? '16px' : day.hasContent ? '12px' : '8px',
                borderRadius: '50%',
                backgroundColor: day.isToday
                  ? colors.primary
                  : day.hasContent
                    ? colors.success
                    : day.isPast
                      ? colors.textMuted
                      : colors.border,
                border: day.isToday ? `3px solid ${colors.primary}40` : 'none',
                marginTop: '18px',
              }} />
            </div>

            {/* Day Content */}
            <div style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: day.isToday
                ? `${colors.primary}08`
                : day.hasContent
                  ? colors.cardBg
                  : 'transparent',
              borderRadius: '10px',
              border: day.isToday
                ? `2px solid ${colors.primary}40`
                : day.hasContent
                  ? `1px solid ${colors.border}`
                  : 'none',
              minHeight: day.hasContent ? 'auto' : '44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {/* Day Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: day.hasContent ? '12px' : '0',
              }}>
                <span style={{
                  fontWeight: '700',
                  color: day.isToday ? colors.primary : colors.text,
                  fontSize: '15px',
                }}>
                  Day {day.dayNumber}
                </span>
                <span style={{
                  color: colors.textMuted,
                  fontSize: '13px',
                }}>
                  {day.dayOfWeek}, {day.monthDay}
                </span>
                {day.isToday && (
                  <span style={{
                    padding: '2px 10px',
                    backgroundColor: colors.primary,
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}>
                    TODAY
                  </span>
                )}
                {!day.hasContent && !day.isToday && (
                  <span style={{
                    color: colors.textMuted,
                    fontSize: '12px',
                    fontStyle: 'italic',
                  }}>
                    No activities planned
                  </span>
                )}
              </div>

              {/* Scheduled Activities */}
              {day.activities.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {day.activities.map(activity => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: '8px',
                        borderLeft: `3px solid ${activity.completed ? colors.success : colors.primary}`,
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>
                        {activity.type === 'activity' ? '🎯' : '✅'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          color: activity.completed ? colors.textMuted : colors.text,
                          fontSize: '14px',
                          fontWeight: '500',
                          textDecoration: activity.completed ? 'line-through' : 'none',
                        }}>
                          {activity.title}
                        </span>
                        {activity.assignedTo && (
                          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
                            Assigned to: {getUserDisplayName(activity.assignedTo, profiles, auth.currentUser?.uid)}
                          </div>
                        )}
                      </div>
                      {activity.completed && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: colors.successLight,
                          color: colors.success,
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          Done
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks Due */}
              {day.tasks.length > 0 && (
                <div style={{
                  marginTop: day.activities.length > 0 ? '8px' : '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {day.activities.length > 0 && (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      marginTop: '4px',
                    }}>
                      Tasks Due
                    </div>
                  )}
                  {day.tasks.map(task => {
                    const priority = getPriorityStyle(task.priority);
                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: colors.backgroundTertiary,
                          borderRadius: '8px',
                          borderLeft: `3px solid ${task.completed ? colors.success : colors.warning}`,
                        }}
                      >
                        <span style={{
                          color: task.completed ? colors.textMuted : colors.text,
                          fontSize: '14px',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          flex: 1,
                        }}>
                          {task.title}
                        </span>
                        {task.priority && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: priority.bg,
                            color: priority.color,
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: '600',
                          }}>
                            {priority.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItineraryView;
