import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function createConnection() {
  const db = await open({
    filename: './bot_data.db',
    driver: sqlite3.Database
  });
  console.log('Database connection established successfully.');
  return db;
}

async function createTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      settings TEXT
    )
  `);
}

async function getGuildSettings(db, guildId) {
  try {
    const row = await db.get(
      'SELECT settings FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    if (!row) return null;

    const settings = JSON.parse(row.settings);

    const sanitizedSettings = Object.fromEntries(
      Object.entries(settings).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : value
      ])
    );

    return sanitizedSettings;
  } catch (error) {
    console.error(`Error fetching settings for guild ${guildId}:`, error);
    return null;
  }
}

async function setGuildSetting(db, guildId, key, value) {
  try {
    await db.run(`
      INSERT INTO guild_settings (guild_id, settings)
      VALUES (?, json_set(COALESCE(
        (SELECT settings FROM guild_settings WHERE guild_id = ?),
        '{}'),
        '$.' || ?, ?))
      ON CONFLICT(guild_id) DO UPDATE SET
      settings = json_set(settings, '$.' || ?, ?)
    `, [guildId, guildId, key, JSON.stringify(value), key, JSON.stringify(value)]);

    console.log(`Updated setting ${key} for guild ${guildId}: ${value}`);
  } catch (error) {
    console.error(`Error updating setting ${key} for guild ${guildId}:`, error);
    throw error;
  }
}

async function deleteGuildSettings(db, guildId) {
  await db.run('DELETE FROM guild_settings WHERE guild_id = ?', [guildId]);
}

async function createDatabase() {
  try {
    const db = await createConnection();
    await createTables(db);

    return {
      getGuildSettings: (guildId) => getGuildSettings(db, guildId),
      setGuildSetting: (guildId, key, value) => setGuildSetting(db, guildId, key, value),
      deleteGuildSettings: (guildId) => deleteGuildSettings(db, guildId),
      close: async () => await db.close(),
      areSettingsComplete: async (guildId) => areSettingsComplete(db, guildId)
    };
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

export default async function initializeDatabase() {
  return await createDatabase();
}
