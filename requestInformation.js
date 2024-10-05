import { ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionsBitField } from 'discord.js';

export async function requestCalendarLink(inviter, guild, db) {
  const msg = await inviter.send('Please provide the Luma calendar link you want to fetch events from.');

  const filter = msg => !msg.author.bot;
  const collector = msg.channel.createMessageCollector({ filter, time: 300000, max: 1 });

  return new Promise((resolve) => {
    collector.on('collect', async msg => {
      db.setGuildSetting(guild.id, 'calendarUrl', msg.content);
      resolve(msg.content); // Resolve the promise with the calendar link
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        inviter.send('Setup timed out. Please try again by removing and re-adding the bot to your server.');
        resolve(null); // Resolve with null if timed out
      }
    });
  });
}

export async function requestChannelSelection(inviter, guild, db) {
  const channels = guild.channels.cache
    .filter(channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages))
    .map(channel => ({
      label: channel.name,
      value: channel.id
    }));

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('channel_select')
        .setPlaceholder('Select a channel')
        .addOptions(channels)
    );

  const msg = await inviter.send({
    content: 'Please select the channel where you want to receive Luma Calendar notifications in:',
    components: [row]
  });

  const filter = i => i.customId === 'channel_select' && i.user.id === inviter.id;
  const collector = msg.createMessageComponentCollector({ filter, time: 300000, max: 1 });

  return new Promise((resolve) => {
    collector.on('collect', async i => {
      const notificationsChannelId = i.values[0];
      await db.setGuildSetting(guild.id, 'notificationsChannelId', notificationsChannelId);
      resolve(notificationsChannelId);
      await i.update({ content: 'Channel selected!', components: [] });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        inviter.send('Channel selection timed out. Please try the setup process again by removing and re-adding the bot to your server.');
        resolve(null);
      }
    });
  });
}
