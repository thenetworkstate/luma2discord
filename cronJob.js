import { CronJob } from 'cron';

import { scrapeLumaCalendar } from './lumaScraper.js';
import showEvents from './showEvents.js';

async function setupCronJob(client, guildId, db) {
  const cronJobs = new Map();

  const { calendarUrl, notificationsChannelId } = await db.getGuildSettings(guildId);

  // Stop from creating new cron job if one already exists
  if (cronJobs.has(guildId)) {
    cronJobs.get(guildId).stop();
  }

  if (calendarUrl && notificationsChannelId) {
    const job = new CronJob('0 * * * * *', async () => {

    try {
      const events = await scrapeLumaCalendar(calendarUrl);
      const channel = await client.channels.fetch(notificationsChannelId);

      if (channel) {
        await channel.send(showEvents(events));
      } else {
        console.error(`Channel not found for guild ${guildId}`);
      }
    } catch (error) {
      console.error(`Error in cron job for guild ${guildId}:`, error);
      }
    });

    cronJobs.set(guildId, job);

    return job;
  }
}

export default async function runCronJob(client, guildId, db) {
  const job = await setupCronJob(client, guildId, db);
  job.start();
}
