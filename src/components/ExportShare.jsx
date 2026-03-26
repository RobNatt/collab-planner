import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';
import { auth } from '../config/firebase';
import { downloadICal, getGoogleCalendarUrl } from '../utils/icalExport';
import toast from 'react-hot-toast';

function ExportShare({ plan, activities, expenses }) {
  const { colors } = useTheme();
  const { profiles } = useUserProfiles(plan?.members || []);
  const [shareLink, setShareLink] = useState('');
  const [copying, setCopying] = useState(false);

  const scheduledActivities = activities
    .filter(a => a.scheduledDate)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const tasks = activities.filter(a => a.type === 'task' || !a.type);
  const activityItems = activities.filter(a => a.type === 'activity');

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Generate dates between start and end
  const getDaysBetween = (start, end) => {
    const days = [];
    const current = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    while (current <= endDate) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const generatePrintContent = () => {
    const tripDays = plan.startDate && plan.endDate
      ? getDaysBetween(plan.startDate, plan.endDate)
      : [];

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${plan.name} - Trip Plan</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 28px; margin-bottom: 8px; color: #1a1a1a; }
          h2 { font-size: 20px; margin: 32px 0 16px; color: #2196F3; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
          h3 { font-size: 16px; margin: 20px 0 10px; color: #333; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
          .meta { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
          .meta-item { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
          .meta-item strong { display: block; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
          .task-list { list-style: none; padding: 0; }
          .task-list li { padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
          .task-list li:last-child { border-bottom: none; }
          .checkbox { width: 16px; height: 16px; border: 2px solid #ddd; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .checkbox.checked { background: #4CAF50; border-color: #4CAF50; color: white; font-size: 10px; }
          .completed { text-decoration: line-through; color: #999; }
          .priority { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
          .priority-high { background: #ffebee; color: #f44336; }
          .priority-medium { background: #fff3e0; color: #FF9800; }
          .priority-low { background: #e8f5e9; color: #4CAF50; }
          .day-section { margin-bottom: 20px; page-break-inside: avoid; }
          .day-header { background: #f0f7ff; padding: 10px 16px; border-radius: 8px; font-weight: 600; margin-bottom: 8px; }
          .expense-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .expense-table th, .expense-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
          .expense-table th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; }
          .total-row { font-weight: bold; background: #f0f7ff; }
          .members-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
          .member-chip { background: #e3f2fd; color: #1976D2; padding: 6px 14px; border-radius: 20px; font-size: 13px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 12px; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${plan.name}</h1>
        ${plan.description ? `<p class="subtitle">${plan.description}</p>` : ''}

        <div class="meta">
          <div class="meta-item">
            <strong>Dates</strong>
            ${plan.startDate} to ${plan.endDate}
          </div>
          <div class="meta-item">
            <strong>Members</strong>
            ${plan.members?.length || 1} people
          </div>
          <div class="meta-item">
            <strong>Tasks</strong>
            ${completedTasks}/${tasks.length} complete
          </div>
          <div class="meta-item">
            <strong>Total Expenses</strong>
            $${totalExpenses.toFixed(2)}
          </div>
        </div>

        <div class="members-list">
          ${(plan.members || []).map(id =>
            `<span class="member-chip">${getUserDisplayName(id, profiles, auth.currentUser?.uid)}</span>`
          ).join('')}
        </div>
    `;

    // Itinerary section
    if (tripDays.length > 0 && scheduledActivities.length > 0) {
      html += `<h2>Itinerary</h2>`;
      tripDays.forEach((day, index) => {
        const dayActivities = scheduledActivities.filter(a => a.scheduledDate === day);
        if (dayActivities.length > 0) {
          const dayDate = new Date(day + 'T00:00:00');
          html += `
            <div class="day-section">
              <div class="day-header">Day ${index + 1} - ${dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <ul class="task-list">
                ${dayActivities.map(a => `
                  <li>
                    <span class="checkbox ${a.completed ? 'checked' : ''}">${a.completed ? '✓' : ''}</span>
                    <span class="${a.completed ? 'completed' : ''}">${a.title}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        }
      });
    }

    // Tasks section
    if (tasks.length > 0) {
      html += `<h2>Tasks</h2><ul class="task-list">`;
      tasks.forEach(task => {
        const priorityClass = task.priority === 'high' ? 'priority-high' : task.priority === 'low' ? 'priority-low' : 'priority-medium';
        html += `
          <li>
            <span class="checkbox ${task.completed ? 'checked' : ''}">${task.completed ? '✓' : ''}</span>
            <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
            ${task.priority ? `<span class="priority ${priorityClass}">${task.priority}</span>` : ''}
            ${task.dueDate ? `<span style="color:#666;font-size:12px;margin-left:auto;">Due: ${task.dueDate}</span>` : ''}
          </li>
        `;
      });
      html += `</ul>`;
    }

    // Activities section
    if (activityItems.length > 0) {
      html += `<h2>Activities</h2><ul class="task-list">`;
      activityItems.forEach(activity => {
        html += `
          <li>
            <span class="checkbox ${activity.completed ? 'checked' : ''}">${activity.completed ? '✓' : ''}</span>
            <span class="${activity.completed ? 'completed' : ''}">${activity.title}</span>
            ${activity.scheduledDate ? `<span style="color:#666;font-size:12px;margin-left:auto;">${activity.scheduledDate}</span>` : ''}
          </li>
        `;
      });
      html += `</ul>`;
    }

    // Expenses section
    if (expenses.length > 0) {
      html += `
        <h2>Expenses</h2>
        <table class="expense-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Paid By</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${e.description}</td>
                <td>${e.category || '-'}</td>
                <td>${getUserDisplayName(e.paidBy, profiles, auth.currentUser?.uid)}</td>
                <td style="text-align:right">$${(e.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">Total</td>
              <td style="text-align:right">$${totalExpenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    html += `
        <div class="footer">
          Generated from Collab Planner on ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    toast.success('Print dialog opened!');
  };

  const handleExportPDF = () => {
    // Use print-to-PDF via browser's built-in functionality
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    toast.success('Use "Save as PDF" in the print dialog');
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const headers = ['Description', 'Category', 'Paid By', 'Amount', 'Split Type'];
    const rows = expenses.map(e => [
      `"${e.description}"`,
      e.category || '',
      getUserDisplayName(e.paidBy, profiles, auth.currentUser?.uid),
      (e.amount || 0).toFixed(2),
      e.splitType || 'even',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name.replace(/[^a-z0-9]/gi, '_')}_expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Expenses exported as CSV!');
  };

  const handleCopyShareLink = async () => {
    const link = `${window.location.origin}/invite/${plan.inviteCode}`;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(link);
      setShareLink(link);
      toast.success('Share link copied!');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareLink(link);
      toast.success('Share link copied!');
    } finally {
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const handleExportICal = () => {
    downloadICal(plan, activities);
    toast.success('Calendar file downloaded! Import into any calendar app.');
  };

  const handleAddToGoogleCalendar = () => {
    const url = getGoogleCalendarUrl(plan);
    if (url) {
      window.open(url, '_blank');
      toast.success('Opening Google Calendar...');
    } else {
      toast.error('Set trip dates first');
    }
  };

  const exportOptions = [
    {
      icon: '🖨️',
      title: 'Print Itinerary',
      description: 'Print a formatted view of your trip plan',
      action: handlePrint,
      color: colors.primary,
    },
    {
      icon: '📄',
      title: 'Export as PDF',
      description: 'Save your trip plan as a PDF document',
      action: handleExportPDF,
      color: colors.success,
    },
    {
      icon: '📅',
      title: 'Export to Calendar (.ics)',
      description: 'Download for Apple Calendar, Outlook, or any calendar app',
      action: handleExportICal,
      color: colors.deepPurple,
    },
    {
      icon: '📆',
      title: 'Add to Google Calendar',
      description: 'Open Google Calendar with your trip pre-filled',
      action: handleAddToGoogleCalendar,
      color: colors.danger,
    },
    {
      icon: '📊',
      title: 'Export Expenses (CSV)',
      description: 'Download expenses as a spreadsheet file',
      action: handleExportCSV,
      color: colors.warning,
    },
    {
      icon: '🔗',
      title: 'Share Invite Link',
      description: 'Copy a link others can use to join this plan',
      action: handleCopyShareLink,
      color: colors.purple,
    },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '8px' }}>Export & Share</h2>
      <p style={{ color: colors.textSecondary, marginBottom: '24px', fontSize: '14px' }}>
        Export your trip plan or share it with others.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {exportOptions.map((option, i) => (
          <button
            key={i}
            onClick={option.action}
            style={{
              padding: '24px',
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = option.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: `${option.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}>
              {option.icon}
            </div>
            <div>
              <div style={{
                fontWeight: '600',
                color: colors.text,
                fontSize: '15px',
                marginBottom: '4px',
              }}>
                {option.title}
              </div>
              <div style={{
                color: colors.textMuted,
                fontSize: '13px',
                lineHeight: '1.4',
              }}>
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Share Link Display */}
      {shareLink && (
        <div style={{
          padding: '16px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '18px' }}>🔗</span>
          <code style={{
            flex: 1,
            color: colors.primary,
            fontSize: '13px',
            wordBreak: 'break-all',
          }}>
            {shareLink}
          </code>
          <button
            onClick={handleCopyShareLink}
            style={{
              padding: '6px 14px',
              backgroundColor: copying ? colors.success : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            {copying ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Plan Summary */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: colors.backgroundTertiary,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ color: colors.text, margin: '0 0 16px 0', fontSize: '16px' }}>
          Plan Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '16px',
        }}>
          {[
            { label: 'Members', value: plan.members?.length || 1, icon: '👥' },
            { label: 'Tasks', value: `${completedTasks}/${tasks.length}`, icon: '✅' },
            { label: 'Activities', value: activityItems.length, icon: '📅' },
            { label: 'Scheduled', value: scheduledActivities.length, icon: '📆' },
            { label: 'Expenses', value: `$${totalExpenses.toFixed(2)}`, icon: '💰' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>{stat.value}</div>
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExportShare;
