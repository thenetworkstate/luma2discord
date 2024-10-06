import { ActionRowBuilder, ChannelType, PermissionsBitField, StringSelectMenuBuilder } from 'discord.js';

export function actionRowBuilder(customId, placeholder, options) {
  return new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(placeholder)
        .addOptions(options)
    );
}

export function getChannels(guild) {
  return guild.channels.cache
    .filter(channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages))
    .map(channel => ({
      label: channel.name,
      value: channel.id
    }));
}
