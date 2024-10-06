import { actionRowBuilder, getChannels } from '../utils/discordInteractions.js';
import { hours, timezones } from '../utils/time.js';

export async function requestCalendarLink(inviter, guild, db) {
  const msg = await inviter.send('Please provide the Luma calendar link you want to fetch events from.');

  const filter = msg => !msg.author.bot;

  try {
    const collected = await msg.channel.awaitMessages({
      filter,
      time: 300000,
      max: 1,
      errors: ['time']
    });

    const response = collected.first();
    await db.setGuildSetting(guild.id, 'calendarUrl', response.content);
    return response.content;
  } catch (error) {
    await inviter.send('Setup timed out. Please try again by removing and re-adding the bot to your server.');
    return null;
  }
}

export async function requestChannelSelection(inviter, guild, db) {
  const channels = getChannels(guild);

  const row = actionRowBuilder(
    'channel_select',
    'Select a channel',
    channels
  );

  const msg = await inviter.send({
    content: 'Please select the channel where you want to receive Luma Calendar notifications in:',
    components: [row]
  });

  const filter = i => i.customId === 'channel_select' && i.user.id === inviter.id;

  try {
    const interaction = await msg.awaitMessageComponent({
      filter,
      time: 300000
    });

    const notificationsChannelId = interaction.values[0];
    await db.setGuildSetting(guild.id, 'notificationsChannelId', notificationsChannelId);
    await interaction.update({ content: 'Channel selected!', components: [] });
    return notificationsChannelId;
  } catch (error) {
    await inviter.send('Channel selection timed out. Please try the setup process again by removing and re-adding the bot to your server.');
    return null;
  }
}

async function requestTime(inviter) {
  const row = actionRowBuilder(
    'time_select',
    'Select the hour for daily notifications',
    [{label: '15:03', value: '15:03'}, {label: '15:07', value: '13:07'}]
  );

  const timeMsg = await inviter.send({
    content: 'At what hour would you like to receive daily event notifications? (4 AM to midnight)',
    components: [row]
  });

  try {
    const interaction = await timeMsg.awaitMessageComponent({
      filter: i => i.customId === 'time_select' && i.user.id === inviter.id,
      time: 300000
    });

    await interaction.update({ content: `You selected ${interaction.values[0]}:00 for daily notifications.`, components: [] });
    return `${interaction.values[0]}:00`;
  } catch (error) {
    console.error('Error in requestTime:', error);
    await inviter.send('Time selection timed out. Please try the setup process again.');
    return null;
  }
}

async function requestTimezone(inviter) {
  const row = actionRowBuilder(
    'timezone_select',
    'Select your timezone',
    timezones
  );

  const tzMsg = await inviter.send({
    content: 'Please select your timezone:',
    components: [row]
  });

  const filter = i => i.customId === 'timezone_select' && i.user.id === inviter.id;
  const options = { filter, time: 300000, max: 1 };

  try {
    const interaction = await tzMsg.awaitMessageComponent(options);
    await interaction.update({ content: 'Timezone selected!', components: [] });
    return interaction.values[0];
  } catch (error) {
    await inviter.send('Timezone selection timed out. Please try the setup process again.');
    return null;
  }
}

export async function requestNotificationTime(inviter, guild, db) {
  const time = await requestTime(inviter);
  if (!time) return null;

  const timezone = await requestTimezone(inviter);
  if (!timezone) return null;

  await db.setGuildSetting(guild.id, 'notificationTime', time);
  await db.setGuildSetting(guild.id, 'timezone', timezone);

  return { time, timezone };
}
