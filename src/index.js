import runCronJob from './services/cronJob.js';
import initializeDatabase from './services/db.js';
import { initiateDMSetup } from './discord-interactions/guildSetup.js';

const db = await initializeDatabase();

export async function setupBot(client) {
  client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
    await handleNewGuild(guild, client);
  });

  await initializeExistingGuilds(client, db);
}

async function initializeExistingGuilds(client) {
  console.log('Initializing existing guilds...');

  client.guilds.cache.forEach(async (guild) => {
    console.log(`Checking guild: ${guild.name} (ID: ${guild.id})`);

    const settings = await db.getGuildSettings(guild.id);
    const completedSettings = await db.areSettingsComplete(settings);

    if (completedSettings) {
      console.log(`Running cron job for guild ${guild.id}`);
      await runCronJob(client, guild.id, db);
    } else {
      console.log(`Incomplete settings for guild ${guild.id}. Setup may be needed.`);
    }
  });
}

export async function handleNewGuild(guild, client) {
  const existingSettings = await db.getGuildSettings(guild.id);
  const completedSettings = await db.areSettingsComplete(existingSettings);

  if (completedSettings) {
    console.log(`Guild ${guild.id} already set up. Skipping setup.`);
    return;
  }

  console.log(`Bot added to new guild: ${guild.name} (ID: ${guild.id})`);
  await initiateDMSetup(guild, client, db);
}
