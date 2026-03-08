/**
 * Generate an iCal (.ics) file from plan data
 * Compatible with Google Calendar, Apple Calendar, Outlook
 */

// Escape special characters for iCal format
const escapeIcal = (str) => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// Format date as iCal date string (YYYYMMDD)
const formatIcalDate = (dateStr) => {
  return dateStr.replace(/-/g, '');
};

// Format date as iCal datetime string (YYYYMMDDTHHMMSSZ)
const formatIcalDateTime = (dateStr, time = '090000') => {
  return `${dateStr.replace(/-/g, '')}T${time}`;
};

// Generate unique ID for events
const generateUID = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@collabplanner`;
};

/**
 * Generate iCal content string
 */
export const generateICalContent = (plan, activities = []) => {
  const scheduledActivities = activities
    .filter(a => a.scheduledDate)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Gang//Trip Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcal(plan.name)}`,
  ];

  // Add the trip itself as an all-day event
  if (plan.startDate && plan.endDate) {
    // End date needs to be +1 day for all-day events in iCal
    const endPlusOne = new Date(plan.endDate + 'T00:00:00');
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    const endDateStr = endPlusOne.toISOString().split('T')[0];

    lines.push(
      'BEGIN:VEVENT',
      `UID:trip-${plan.id}@collabplanner`,
      `DTSTART;VALUE=DATE:${formatIcalDate(plan.startDate)}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND;VALUE=DATE:${formatIcalDate(endDateStr)}`,
      `SUMMARY:${escapeIcal(plan.name)}`,
      `DESCRIPTION:${escapeIcal(plan.description || 'Trip planned with Travel Gang')}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }

  // Add each scheduled activity as an event
  scheduledActivities.forEach(activity => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(activity.scheduledDate)}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${escapeIcal(activity.title)}`,
      `DESCRIPTION:${escapeIcal(`Part of trip: ${plan.name}`)}`,
      `STATUS:${activity.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  });

  // Add tasks with due dates as events
  const tasksWithDueDates = activities.filter(a => a.dueDate && !a.scheduledDate);
  tasksWithDueDates.forEach(task => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(task.dueDate)}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:[Task] ${escapeIcal(task.title)}`,
      `DESCRIPTION:${escapeIcal(`Task for trip: ${plan.name}${task.priority ? ` | Priority: ${task.priority}` : ''}`)}`,
      `STATUS:${task.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`,
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

/**
 * Download iCal file
 */
export const downloadICal = (plan, activities) => {
  const content = generateICalContent(plan, activities);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${plan.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate a Google Calendar URL to add the trip
 */
export const getGoogleCalendarUrl = (plan) => {
  if (!plan.startDate || !plan.endDate) return null;

  const endPlusOne = new Date(plan.endDate + 'T00:00:00');
  endPlusOne.setDate(endPlusOne.getDate() + 1);
  const endDateStr = endPlusOne.toISOString().split('T')[0];

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: plan.name,
    dates: `${formatIcalDate(plan.startDate)}/${formatIcalDate(endDateStr)}`,
    details: plan.description || `Trip planned with Travel Gang`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
