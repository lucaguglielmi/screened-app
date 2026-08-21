// Utility to generate .ics (iCalendar) files for festival submission deadlines

export function downloadFestivalIcs(
  festivalName: string,
  deadlineName: string,
  deadlineDateStr: string,
  feeEstimate?: string,
  festivalUrl?: string
) {
  // Parse date
  let dateObj = new Date(deadlineDateStr);
  if (isNaN(dateObj.getTime())) {
    // If not a standard date format, default to 30 days from now
    dateObj = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const pad = (n: number) => (n < 10 ? '0' + n : n);

  const startYear = dateObj.getUTCFullYear();
  const startMonth = pad(dateObj.getUTCMonth() + 1);
  const startDay = pad(dateObj.getUTCDate());

  const dtStamp = `${startYear}${startMonth}${startDay}T090000Z`;
  const dtStart = `${startYear}${startMonth}${startDay}T090000Z`;
  const dtEnd = `${startYear}${startMonth}${startDay}T180000Z`;

  const summary = `🎬 Submission Deadline: ${festivalName} (${deadlineName})`;
  const description = [
    `Film Festival: ${festivalName}`,
    `Deadline: ${deadlineName} (${deadlineDateStr})`,
    feeEstimate ? `Estimated Fee: ${feeEstimate}` : '',
    festivalUrl ? `URL: ${festivalUrl}` : '',
    '',
    'Tracked via Screened (Agentic Cinema Due-Diligence)'
  ].filter(Boolean).join('\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Screened Cinema Intelligence//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:screened-${Date.now()}@screened.cinema`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Festival submission deadline reminder',
    'TRIGGER:-P3D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${festivalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deadline.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
