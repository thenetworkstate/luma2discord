import { bold } from 'discord.js';

function displayEvents(events) {
  if (events.length === 0) {
    return "🥹 No events scheduled for today.";
  }

  return events.map((event) => {
    const localStartTime = moment.tz(event.startTime, timezone).format('h:mm A');

    return (
      `
📆 ${bold('Event')}: ${event.title}
⏰ ${bold('Time')}: ${localStartTime} ${timezone}
📍 ${bold('Location')}: ${event.address}
👤 ${bold('Hosts')}: ${event.hosts}
🔗 ${bold('For more details')}: ${event.url}
      `
    );
  }).join('');
};

export default function showEvents(events) {
  return `
  ## Today's Events \n\n
  ${displayEvents(events)}
  `
}
