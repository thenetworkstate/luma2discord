import dotenv from 'dotenv';
import express from 'express';
import { Client, GatewayIntentBits, InteractionResponseType } from 'discord.js';

import { setupBot } from './src/bot.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
});

app.get('/', (req, res) => {
  res.send('Luma Calendar Discord Bot is running!');
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

export { client };
