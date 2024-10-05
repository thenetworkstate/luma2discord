# Luma Calendar Discord Bot

## Description

The Luma Calendar Discord Bot is a tool that integrates Luma Calendar events with Discord servers. It allows users to receive notifications about upcoming events directly in their Discord channels every 24h, making it easier for communities to stay informed and organized.

## Architecture

The bot is built using Node.js and utilizes the Discord.js library for interacting with the Discord API. It follows a modular architecture for easy maintenance and scalability.

-- PS: The Discord API calls Discord servers "guilds". We have kept the same nomencalture throughout the bot for easier readability.

## File Structure

- `index.js`: Main entry point of the application. Handles bot initialization and Discord event listeners.
- `guildSetup.js`: Manages the setup process for new guilds, including user interactions for configuration.
- `requestInformation.js`: Contains functions for requesting and handling user input during the setup process.
- `cronJob.js`: Manages the scheduling and execution of periodic tasks, such as fetching and posting event updates.
- `lumaScraper.js`: Manages the scraping of Luma Calendar events. This can be improved by using the Luma API for calendars with a paying subscription.
- `showEvents.js`: Manages the display of events in the Discord channel.
- `db.js`: Handles database operations for storing and retrieving guild settings.
- `simulateGuildCreate.js`: Provides functionality for simulating guild creation events (for development testing).

## Setup and Running

1. Clone the repository:
   ```
   git clone https://github.com/your-username/luma-calendar-discord-bot.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following contents:
   ```
   CLIENT_TOKEN=your_discord_bot_token
   NODE_ENV=development  # or 'production' for production environment
   ```

4. Set up your `.env` file:
   Create a `.env` file in the root directory of your project and add the following variables:

   ```
   CLIENT_TOKEN=your_discord_bot_token
   NODE_ENV=development
   TEST_GUILD_ID=your_test_guild_id
   ```

   Here's how to obtain each variable:

   - `CLIENT_TOKEN`: This is your Discord bot token. To get this:
     1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
     2. Create a new application or select an existing one
     3. Go to the "Bot" tab and click "Add Bot" if you haven't already
     4. Under the bot's username, click "Copy" to copy the token

   - `NODE_ENV`: Set this to `development` for testing, or `production` for a live environment
   - `TEST_GUILD_ID`: This is the ID of the guild you want to test with. This allows you to test the bot in a real Discord server. You can find this by right-clicking the server name in Discord and selecting "Copy ID".

5. To start the bot:
   ```
   node index.js
   ```

## Discord Commands

The bot primarily operates through an interactive setup process when added to a new guild. It doesn't use traditional text commands, but instead guides users through setup via DMs and interactive components.

## Development

To simulate adding the bot to a new guild for testing:

1. Set `NODE_ENV=development` in your `.env` file.
2. Run the bot as usual. It will automatically run the `simulateGuildCreate` function if `NODE_ENV=development` is set, so you should have a server to test with.

## Production

For production deployment:

1. Set `NODE_ENV=production` in your `.env` file.
2. Ensure you have a proper database setup. This bot uses sqlite for simplicity.
3. Deploy to your hosting service of choice.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
