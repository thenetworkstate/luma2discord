import dotenv from 'dotenv';
import express from 'express';
import { Client, GatewayIntentBits, InteractionResponseType } from 'discord.js';

import { setupBot } from './src/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
});

app.get('/', (req, res) => {
  res.send('Luma Calendar Discord Bot is running! ⚡️');
});

app.get('/oauth-callback', async (req, res) => {
  const { guild_id } = req.query;

  try {
    const guild = await client.guilds.fetch(guild_id);

    if (guild) {
      console.log(`Bot is in guild ${guild.name} (ID: ${guild.id})`);
    } else {
      console.log(`Bot is not in guild ${guild_id}. Installation failed and user may need to add the bot again.`);
    }

    res.send('Your Discord server has added the Luma Calendar Bot to fetch calendar events and display them daily! Check your DMs to complete the setup 👀.');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).send('An error occurred during setup. Please try again.');
  }
});

app.post('/interactions', express.json(), (req, res) => {
  res.send({
    type: InteractionResponseType.Pong
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setupBot(client);
});

client.login(process.env.DISCORD_TOKEN);
