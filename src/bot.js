import handleNewGuild from './discord-interactions/guildSetup.js';
import runCronJob from './services/cronJob.js';
import initializeDatabase from './services/db.js';

const db = await initializeDatabase();

export function setupBot(client) {
  client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    await handleNewGuild(guild, client, db);
  });

  client.guilds.cache.forEach(async (guild) => {
    const settings = await db.getGuildSettings(guild.id);
    if (settings?.calendarUrl && settings?.notificationsChannelId) {
      console.log(`Running cron job for guild ${guild.id}`);
      await runCronJob(client, guild.id, db);
    } else {
      console.log(`No settings found for guild ${guild.id}. Setup may be needed.`);
      await handleNewGuild(guild, client, db);
    }
  });
}
