import { AuditLogEvent } from 'discord.js';

import runCronJob from './cronJob.js';
import { requestCalendarLink, requestChannelSelection } from './requestInformation.js';

export default async function handleNewGuild(guild, client, db) {
  const existingSettings = await db.getGuildSettings(guild.id);

  if (existingSettings?.calendarUrl && existingSettings?.notificationsChannelId) {
    console.log(`Guild ${guild.id} already set up. Skipping setup.`);
    return;
  }

  console.log(`Bot added to new guild: ${guild.name} (ID: ${guild.id})`);
  await initiateDMSetup(guild, client, db);
}

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

async function initiateDMSetup(guild, client, db) {
  const inviter = await getInviter(guild);

  if (!inviter) {
    console.error(`No inviter found for guild ${guild.id}. Cannot initiate DM setup.`);
    return;
  }

  try {
    await inviter.send(`Thanks for adding me to ${guild.name}! Let's get started with the setup.`);

    const calendarUrl = await requestCalendarLink(inviter, guild, db);
    if (!calendarUrl) return;

    const notificationsChannelId = await requestChannelSelection(inviter, guild, db);
    if (!notificationsChannelId) return;

    await runCronJob(client, guild.id, db);
    await inviter.send('Setup complete! You will now receive Luma Calendar notifications in the selected channel.');
  } catch (error) {
    console.error(`Failed to send DM to inviter in guild ${guild.id}:`, error);
  }
}
