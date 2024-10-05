export default async function simulateGuildCreate(client, db) {
  if (!process.env.TEST_GUILD_ID) {
    console.log('No TEST_GUILD_ID provided in .env file. Skipping test simulation.');
    return;
  }

  try {
    db.deleteGuildSettings(process.env.TEST_GUILD_ID);

    const testGuild = await client.guilds.fetch(process.env.TEST_GUILD_ID);

    if (testGuild) {
      console.log(`Simulating join for test guild: ${testGuild.name}`);
    } else {
      console.log('Test guild not found. Make sure the bot is a member of the specified guild.');
    }
  } catch (error) {
    console.error('Error fetching test guild:', error);
  }
}
