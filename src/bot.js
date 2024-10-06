import handleNewGuild from './discord-interactions/guildSetup.js';
import runCronJob from './services/cronJob.js';
import initializeDatabase, { areSettingsComplete } from './services/db.js';

const db = await initializeDatabase();

export async function setupBot(client) {
  client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
    await handleNewGuild(guild, client, db);
  });

  await initializeExistingGuilds(client);
}

async function initializeExistingGuilds(client) {
  console.log('Initializing existing guilds...');

  client.guilds.cache.forEach(async (guild) => {
    console.log(`Checking guild: ${guild.name} (ID: ${guild.id})`);

    const settings = await db.getGuildSettings(guild.id);
    const completedSettings = areSettingsComplete(settings);

    if (completedSettings) {
      console.log(`Running cron job for guild ${guild.id}`);
      await runCronJob(client, guild.id, db);
    } else {
      console.log(`Incomplete settings for guild ${guild.id}. Setup may be needed.`);
      // Optionally, you could trigger setup here, but it might be better to wait for manual interaction
    }
  });
}
