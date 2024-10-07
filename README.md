# Luma Calendar Discord Bot

## Description

The Luma Calendar Discord Bot integrates Luma Calendar events with Discord servers, providing daily notifications about upcoming events directly in Discord channels. This tool helps communities stay informed and organized.

## Architecture

Built with [Express.js](https://expressjs.com/) leveraging the [Discord.js package](https://www.npmjs.com/package/discord.js), the bot follows a modular architecture for maintainability and scalability.

Note: The Discord API refers to Discord servers as "guilds". This nomenclature is used throughout the bot for consistency and easier readability.

## Setup and Running

1. Clone the repository:
   ```
   git clone https://github.com/<your-username>/luma-calendar-discord-bot.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your `.env` file in the root directory:

   ```
   DISCORD_TOKEN=your_discord_bot_token
   ```

   `DISCORD_TOKEN`: This is your Discord bot token. To get this:
     1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
     2. Create a new application
     3. Go to the "Bot" tab and click "Add Bot" if you haven't already
     4. Under the bot's username, click "Copy" to copy the token

4. Start the bot:
   ```
   npm start
   ```

5. Install the bot in your server:

   1. Once you have the bot server running, you can install the bot to your server by heading over to your [Discord Developer Portal](https://discord.com/developers/applications).
   2. Then, head over to the "OAuth2" tab and add the local endpoint to the "Redirects" section. For development, this should be something like `http://localhost:3000/api/oauth2/callback`. For production, this should be the deployed endpoint.
   3. Once you've added the redirect, then you want to make sure you have all permissions defined in the OAuth2 URL Generator: `identify`, `guilds`, `applications.commands`, `bot`. We're keeping them strategically minimal, but if you want to add more permissions for future functionalities, this is where you'll need to do so.
   4. Then, select the redirect URL you want to work with. This is the URL that Discord will use to redirect the user after they have installed the bot, so it is the endpoint that kickstarts the event listeners within your application.
   5. In "Bot Permissions", make sure you have the following permissions selected:
      - `View Channels`
      - `View Audit Log`
      - `Send Messages`
      - `Manage Messages`
      - `Read Message History`
      - `Use External Emojis`
      - `Add Reactions`
  1. After defining the permissions, make sure you've selected "Guild install" as your integration type and then copy and paste the Generated URL into your browser to install the bot in your server.

## Discord Commands

The bot primarily operates through an interactive setup process when added to a new guild. It doesn't use traditional text commands, but instead guides users through setup via DMs and interactive components.

## Development

Important to note:
- Make sure you're running the server locally when you install it in your server.
- Make sure you add the development endpoint to the "Redirects" section in the Discord Developer Portal.
- To test, make sure the server you're using doesn't have the bot already installed. If you're testing, it's likely you'll also want to remove the guild from the database to start fresh. You can do this through calling `sqlite` in your terminal and then deleting the row in the `guild_settings` table or using a database browser like [DB Browser](https://sqlitebrowser.org/dl/) to review the data visually..

## Production

For production deployment:

1. You can deploy your application in whichever hosting service of choice. Personally, I've been using Heroku's free tier with 1 dyno (which is why the `Procfile` is here), keeping it alive by setting up Uptime Robot to ping the endpoint every 5 minutes. Since the database is small, this should be fine.
   1. To deploy: `heroku deploy`
   2. To set up the dyno: `heroku ps:scale web=1`
   3. To debug logs: `heroku logs --tail`
2. Make sure to set up your config variables in your production environment.

## Folder Structure

- `server.js`: Main server file containing the Express.js application paths.
- `src/`: Main source code directory
  - `index.js`: Main entry point of the application. Handles bot initialization and Discord event listeners.
  - `services/`: Contains logic interacting with external services.
    - `cronJob.js`: Manages the scheduling and execution of periodic tasks, such as fetching and posting event updates.
    - `db.js`: Handles database operations for storing and retrieving guild settings.
    - `lumaScraper.js`: Manages the scraping of Luma Calendar events. This can be improved by using the Luma API for calendars with a paying subscription.
  - `utils/`: Contains utility functions and helpers.
    - `showEvents.js`: Manages the display of events in the Discord channel.
    - `time.js`: Contains functions for handling time-related operations.
  - `discord-interactions/`: Handles interactions with Discord's API.
    - `guildSetup.js`: Manages the setup process for new guilds, including user interactions for configuration.
    - `requestInformation.js`: Contains functions for requesting and handling user input during the setup process.
- `.env`: Stores environment variables.
- `package.json`: Defines the project dependencies and scripts.
- `README.md`: Project documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE]([LICENSE](https://www.gnu.org/licenses/gpl-3.0.en.html)) file for details.

This license allows others to use, modify, and distribute this code, but requires that any modifications or derivative works also be released under the same GPL license. This ensures that improvements and modifications to the code remain open source.
