import { useState } from 'react';

function Calendar({ plan, activities = [], onDayClick }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  // Parse plan dates
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  // Get current month/year to display (based on trip start date)
  const [currentDate, setCurrentDate] = useState(new Date(startDate));

  // Helper function to check if a date is within the trip range
  const isInTripRange = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  };

  // Helper function to check if date is start or end of trip
  const isTripStart = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return d.getTime() === start.getTime();
  };

  const isTripEnd = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return d.getTime() === end.getTime();
  };

  // Helper function to get activities for a specific date
  const getActivitiesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return activities.filter(activity => activity.scheduledDate === dateString);
  };

  const hasScheduledActivities = (date) => {
    return getActivitiesForDate(date).length > 0;
  };

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Generate week view
  const generateWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Go to Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate weeks
  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = viewMode === 'month' ? generateMonthDays() : generateWeekDays();

  // Calculate trip duration
  const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>📅 Trip Calendar</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 12px',
              backgroundColor: viewMode === 'month' ? '#2196F3' : '#ddd',
              color: viewMode === 'month' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            style={{
              padding: '6px 12px',
              backgroundColor: viewMode === 'week' ? '#2196F3' : '#ddd',
              color: viewMode === 'week' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Week
          </button>
        </div>
      </div>

      {/* Trip Info */}
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #2196F3'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{plan.startDate}</strong> to <strong>{plan.endDate}</strong>
          </div>
          <div style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {tripDuration} {tripDuration === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={viewMode === 'month' ? previousMonth : previousWeek}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← {viewMode === 'month' ? 'Previous' : 'Prev Week'}
        </button>
        <h4 style={{ margin: 0 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <button
          onClick={viewMode === 'month' ? nextMonth : nextWeek}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {viewMode === 'month' ? 'Next' : 'Next Week'} →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {/* Day headers */}
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#666',
              fontSize: '14px'
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const inRange = isInTripRange(date);
          const isStart = isTripStart(date);
          const isEnd = isTripEnd(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const hasActivities = hasScheduledActivities(date);
          const dayActivities = getActivitiesForDate(date);

          return (
            <div
              key={index}
              onClick={() => onDayClick && onDayClick(date)}
              style={{
                padding: '12px',
                textAlign: 'center',
                backgroundColor: inRange ? '#4CAF50' : (isToday ? '#fff3e0' : 'white'),
                color: inRange ? 'white' : (isToday ? '#FF9800' : '#333'),
                borderRadius: '8px',
                border: isToday ? '2px solid #FF9800' : '1px solid #ddd',
                fontWeight: inRange || isToday ? 'bold' : 'normal',
                position: 'relative',
                minHeight: viewMode === 'month' ? '60px' : '80px',
                cursor: onDayClick ? 'pointer' : 'default',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => onDayClick && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => onDayClick && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div>{date.getDate()}</div>
              {isStart && (
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  backgroundColor: '#2196F3',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  START
                </div>
              )}
              {isEnd && (
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  backgroundColor: '#f44336',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  END
                </div>
              )}
              {hasActivities && (
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontWeight: 'bold'
                }}>
                  {dayActivities.length} {dayActivities.length === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
        fontSize: '14px',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#4CAF50',
            borderRadius: '4px'
          }} />
          <span>Trip Dates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#fff3e0',
            border: '2px solid #FF9800',
            borderRadius: '4px'
          }} />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
