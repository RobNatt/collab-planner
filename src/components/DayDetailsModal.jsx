import { useState } from 'react';

function DayDetailsModal({ date, activities, onClose, isAdmin, onUnschedule }) {
  if (!date) return null;

  const dateString = date.toISOString().split('T')[0];
  const scheduledActivities = activities.filter(
    activity => activity.scheduledDate === dateString
  );

  const formatTime = (time) => {
    if (!time) return 'Time not set';
    return time;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0 }}>
            📅 {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        {scheduledActivities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999'
          }}>
            <p style={{ fontSize: '18px' }}>No activities scheduled for this day</p>
            <p style={{ fontSize: '14px' }}>
              Schedule activities from the task list below to see them here
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {scheduledActivities
              .sort((a, b) => {
                // Sort by time
                const timeA = a.scheduledTime || '23:59';
                const timeB = b.scheduledTime || '23:59';
                return timeA.localeCompare(timeB);
              })
              .map(activity => {
                const isTask = (activity.type || 'task') === 'task';
                return (
                  <div
                    key={activity.id}
                    style={{
                      padding: '15px',
                      backgroundColor: isTask ? '#e3f2fd' : '#fff3e0',
                      border: `2px solid ${isTask ? '#2196F3' : '#FF9800'}`,
                      borderLeft: `6px solid ${isTask ? '#2196F3' : '#FF9800'}`,
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '5px'
                        }}>
                          <span style={{
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}>
                            {formatTime(activity.scheduledTime)}
                          </span>
                          <span style={{
                            backgroundColor: isTask ? '#2196F3' : '#FF9800',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {isTask ? 'TASK' : 'ACTIVITY'}
                          </span>
                        </div>
                        <h3 style={{ margin: '10px 0 5px 0' }}>
                          {activity.title}
                        </h3>
                        {activity.completed && (
                          <span style={{
                            color: '#4CAF50',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => onUnschedule(activity.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Unschedule
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DayDetailsModal;
