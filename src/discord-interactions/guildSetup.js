import { AuditLogEvent, bold } from 'discord.js';

import runCronJob from '../services/cronJob.js';
import { requestCalendarLink, requestChannelSelection, requestNotificationTime, getChannelName } from './requestInformation.js';

async function getInviter(guild) {
  try {
    const auditLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.BotAdd
    });

    const botAddLog = auditLogs.entries.first();
    return botAddLog ? botAddLog.executor : null;
  } catch (error) {
    console.error(`Couldn't fetch audit logs for guild ${guild.id}:`, error);
    return null;
  }
}

export async function initiateDMSetup(guild, client, db) {
   const setupStarted = await db.hasSetupStarted(guild.id);

  if (setupStarted) {
    console.log(`Setup already in progress for guild ${guild.id}. Skipping.`);
    return;
  }

  await db.setSetupStarted(guild.id, true);

  try {
    const inviter = await getInviter(guild);

    if (!inviter) {
      console.error(`No inviter found for guild ${guild.id}. Cannot initiate DM setup.`);
      return;
    }

    await inviter.send(`👋🏼 Hello! \n Thanks for adding me to ${guild.name}! Let's get started with the setup. \n We will ask you ${bold('4 things')} to set you up: \n 1. The ${bold('Luma calendar link')} where the events live \n 2. The ${bold('channel')} in your server where you want to receive notifications \n 3. The ${bold('time')} at which you want the events to be displayed \n 4. The ${bold('timezone')} of that timing \n\n Once you have provided these, we will be ready to go!`);

    const calendarUrl = await requestCalendarLink(inviter, guild, db);
    if (!calendarUrl) return;

    const notificationsChannelId = await requestChannelSelection(inviter, guild, db);
    if (!notificationsChannelId) return;
    const channelName = await getChannelName(client, notificationsChannelId);

    const { time, timezone } = await requestNotificationTime(inviter, guild, db);
    if (!time || !timezone) return;

    await runCronJob(client, guild.id, db);
    await inviter.send(`${bold('Setup completed!')} \n Nothing else to do now but wait. Can You will now receive a list of all the Luma Calendar events going on that day in the selected channel. \n Here is a rundown of your settings: \n 📅 ${bold('Calendar URL:')} ${calendarUrl} \n 🛎️ ${bold('Notifications Channel:')} ${channelName} \n ⏰ ${bold('Notification Time:')} ${time} \n 🌎 ${bold('Timezone:')} ${timezone} \n ⚠️ -- ${bold('Keep in mind')}, if you want to change any of these settings, you will have to uninstall and reinstall the bot.`);
  } catch (error) {
    console.error(`Failed to send DM to inviter in guild ${guild.id}:`, error);
  } finally {
    await db.setSetupStarted(guild.id, false);
  }
}
