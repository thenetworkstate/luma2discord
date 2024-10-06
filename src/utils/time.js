export const hours = Array.from({ length: 21 }, (_, i) => {
  const hour = (i + 4) % 24;

  return {
    label: `${hour.toString().padStart(2, '0')}:00`,
    value: hour.toString().padStart(2, '0')
  };
});

export const timezones = [
  { label: 'UTC-08:00 (Pacific Time - Los Angeles)', value: 'America/Los_Angeles' },
  { label: 'UTC-07:00 (Mountain Time - Denver)', value: 'America/Denver' },
  { label: 'UTC-06:00 (Central Time - Chicago)', value: 'America/Chicago' },
  { label: 'UTC-05:00 (Eastern Time - New York)', value: 'America/New_York' },
  { label: 'UTC-04:00 (Atlantic Time - Halifax)', value: 'America/Halifax' },
  { label: 'UTC-03:00 (São Paulo)', value: 'America/Sao_Paulo' },
  { label: 'UTC+00:00 (London)', value: 'Europe/London' },
  { label: 'UTC+01:00 (Central European Time - Paris)', value: 'Europe/Paris' },
  { label: 'UTC+02:00 (Eastern European Time - Helsinki)', value: 'Europe/Helsinki' },
  { label: 'UTC+03:00 (Moscow)', value: 'Europe/Moscow' },
  { label: 'UTC+04:00 (Dubai)', value: 'Asia/Dubai' },
  { label: 'UTC+05:30 (India Standard Time - Mumbai)', value: 'Asia/Kolkata' },
  { label: 'UTC+07:00 (Bangkok)', value: 'Asia/Bangkok' },
  { label: 'UTC+08:00 (China Standard Time - Shanghai)', value: 'Asia/Shanghai' },
  { label: 'UTC+08:00 (Singapore)', value: 'Asia/Singapore' },
  { label: 'UTC+09:00 (Japan Standard Time - Tokyo)', value: 'Asia/Tokyo' },
  { label: 'UTC+09:30 (Australian Central Time - Adelaide)', value: 'Australia/Adelaide' },
  { label: 'UTC+10:00 (Australian Eastern Time - Sydney)', value: 'Australia/Sydney' },
  { label: 'UTC+12:00 (New Zealand Standard Time - Auckland)', value: 'Pacific/Auckland' },
  { label: 'UTC-10:00 (Hawaii-Aleutian - Honolulu)', value: 'Pacific/Honolulu' },
  { label: 'UTC+05:00 (Pakistan Standard Time - Karachi)', value: 'Asia/Karachi' },
  { label: 'UTC+03:00 (East Africa Time - Nairobi)', value: 'Africa/Nairobi' },
  { label: 'UTC+02:00 (Central Africa Time - Cairo)', value: 'Africa/Cairo' },
  { label: 'UTC+01:00 (West Africa Time - Lagos)', value: 'Africa/Lagos' }
];
