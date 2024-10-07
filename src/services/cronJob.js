import { CronJob } from 'cron';

import { scrapeLumaCalendar } from './lumaScraper.js';
import showEvents from '../utils/showEvents.js';

async function setupCronJob(client, guildId, db) {
  const cronJobs = new Map();

  const { calendarUrl, notificationsChannelId, notificationTime, timezone } = await db.getGuildSettings(guildId);

  // Stop from creating new cron job if one already exists
  if (cronJobs.has(guildId)) {
    cronJobs.get(guildId).stop();
  }

  if (calendarUrl && notificationsChannelId && notificationTime && timezone) {
    const [hours, minutes] = notificationTime.split(':');
    const cronFrequency = `${minutes} ${hours} * * *`;

    const job = new CronJob(cronFrequency, async () => {
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
    }, null, false, timezone);

    cronJobs.set(guildId, job);

    return job;
  } else {
    console.error(`Incomplete settings for guild ${guildId}. Cannot setup cron job.`);
    return null;
  }
}

export default async function runCronJob(client, guildId, db) {
   const job = await setupCronJob(client, guildId, db);

  if (job) {
    job.start();
    console.log(`Cron job started for guild ${guildId}`);
  } else {
    console.log(`Failed to start cron job for guild ${guildId}`);
  }
}
