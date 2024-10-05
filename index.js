import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

import runCronJob from './cronJob.js';
import initializeDatabase from './db.js';
import handleNewGuild from './guildSetup.js';
import simulateGuildCreate from './simulateGuildCreate.js';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
const db = await initializeDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

client.on('guildCreate', async (guild) => {
  try {
    console.log(`Bot has joined a new server: ${guild.name}`);
    await handleNewGuild(guild, client, db);
  } catch (error) {
    console.error(`Failed to handle setup for new guild ${guild.id}:`, error);
  }
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  if (isDevelopment) {
    console.log('Running in development mode. Simulating guild creation...');
    await simulateGuildCreate(client, db);
  } else {
    console.log('Running in production mode.');
  }

  for (const guild of client.guilds.cache.values()) {
    const settings = await db.getGuildSettings(guild.id);
    console.log(`Settings for guild ${guild.id}:`, settings);

    if (settings?.calendarUrl && settings?.notificationsChannelId) {
      console.log(`Running cron job for guild ${guild.id} with these settings: ${settings}`);
      await runCronJob(client, guild.id, db);
    } else {
      console.log(`No settings found for guild ${guild.id}. Setup may be needed.`);
      await handleNewGuild(guild, client, db);
    }
  }
});

client.login(process.env.CLIENT_TOKEN);
