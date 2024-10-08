import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

async function createConnection() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });

  console.log('PostgreSQL connection established successfully.');

  return pool;
}

async function createTables(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      settings JSONB,
      setup_started BOOLEAN DEFAULT FALSE
    )
  `);
}

async function getGuildSettings(db, guildId) {
  try {
    const result = await db.query(
      'SELECT settings FROM guild_settings WHERE guild_id = $1',
      [guildId]
    );

    if (!result.rows[0]) {
      console.log(`No settings found for guild ${guildId}`);
      return null;
    }

    return result.rows[0]?.settings || {};
  } catch (error) {
    console.error(`Error fetching settings for guild ${guildId}:`, error);
    return null;
  }
}

async function setGuildSetting(db, guildId, key, value) {
  try {
    const result = await db.query(`
      INSERT INTO guild_settings (guild_id, settings)
      VALUES ($1, jsonb_build_object($2::text, $3::text))
      ON CONFLICT (guild_id) DO UPDATE
       SET settings = COALESCE(guild_settings.settings, '{}'::jsonb) || jsonb_build_object($2::text, $3::text)
      RETURNING settings
    `, [guildId, key, value]);
    
    console.log(`Updated setting ${key} for guild ${guildId}: ${value}. Current settings for guild ${guildId}:`, result.rows[0].settings);

    return result.rows[0].settings;
  } catch (error) {
    console.error(`Error updating setting ${key} for guild ${guildId}:`, error);
    throw error;
  }
}

async function areSettingsComplete(db, guildId) {
  if (!guildId) {
    console.error('Invalid guildId provided to areSettingsComplete');
    return false;
  }

  try {
    const settings = await getGuildSettings(db, guildId);

    if (!settings) {
      console.log(`No settings found for guild ${guildId}`);
      return false;
    }

    const requiredSettings = ['calendarUrl', 'notificationsChannelId', 'notificationTime', 'timezone'];
    const hasAllSettings = requiredSettings.every(setting =>
      settings.hasOwnProperty(setting) && settings[setting] !== null && settings[setting] !== ''
    );

    console.log(`Settings completeness for guild ${guildId}:`, hasAllSettings);
    return hasAllSettings;
  } catch (error) {
    console.error(`Error checking settings completeness for guild ${guildId}:`, error);
    return false;
  }
}

async function setSetupStarted(db, guildId, value) {
  try {
    const result = await db.query(`
      INSERT INTO guild_settings (guild_id, setup_started)
      VALUES ($1, $2)
      ON CONFLICT (guild_id) DO UPDATE
      SET setup_started = $2
      RETURNING setup_started
    `, [guildId, value]);

    console.log(`Updated setupStarted for guild ${guildId}: ${value}`);

    return result.rows[0].setup_started;
  } catch (error) {
    console.error(`Error updating setupStarted for guild ${guildId}:`, error);
    throw error;
  }
}

async function hasSetupStarted(db, guildId) {
  try {
    const result = await db.query(
      'SELECT setup_started FROM guild_settings WHERE guild_id = $1',
      [guildId]
    );

    console.log(`Fetched setupStarted for guild ${guildId}:`, result.rows[0]?.setup_started);

    return result.rows[0]?.setup_started;
  } catch (error) {
    console.error(`Error fetching setupStarted for guild ${guildId}:`, error);
    return false;
  }
}

async function createDatabase() {
  try {
    const db = await createConnection();
    await createTables(db);

    return {
      areSettingsComplete: async (guildId) => areSettingsComplete(db, guildId),
      close: async () => await db.end(),
      getGuildSettings: async (guildId) => getGuildSettings(db, guildId),
      setGuildSetting: async (guildId, key, value) => setGuildSetting(db, guildId, key, value),
      hasSetupStarted: async (guildId) => hasSetupStarted(db, guildId),
      setSetupStarted: async (guildId, value) => setSetupStarted(db, guildId, value)
    };
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

export default async function initializeDatabase() {
  return await createDatabase();
}
