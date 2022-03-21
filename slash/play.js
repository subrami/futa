const { SlashCommandBuilder } = require('discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { QueryType } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('loads songs from yt')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('song')
        .setDescription('Loads a single song from a url')
        .addStringOption((option) =>
          option.setName('url').setDescription('song URL').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('playlist')
        .setDescription('loads a playlist of songs from a URL')
        .addStringOption((option) =>
          option.setName('url').setDescription('playlist url').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('searches for song based on given keywords')
        .addStringOption('keywords')
        .setDescription('song keywords')
        .setRequired(true)
    ),
}
