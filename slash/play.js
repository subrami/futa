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
  run: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        'You need to be in a Voice Chat to use this command.'
      )

    const queue = await client.player.createQueue(interaction.guild)
    // connect bot to voice channel member is in
    if (!queue.connection) await queue.connect(interaction.member.voice.channel)

    let embed = new MessageEmbed()

    let commandType = interaction.options.getSubcommand()
    if (commandType == 'song') {
      /*
        Song CommandType
        search parameters: QueryType.YOUTUBE_VIDEO
      */
      let url = interaction.options.getString('url')
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      })

      if (result.tracks.length === 0)
        return interaction.editReply('No results found')

      const song = result.tracks[0]
      await queue.addTrack(song)
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the queue.`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` })
    } else if (commandType == 'playlist') {
      /*
        Playlist CommandType
        search parameters: QueryType.YOUTUBE_PLAYLIST
      */
      let url = interaction.options.getString('url')
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      })

      if (result.tracks.length === 0)
        return interaction.editReply('No results found')

      const playlist = result.playlist
      await queue.addTracks(result.tracks)
      embed
        .setDescription(
          `**[${result.tracks.length} total songs from ${playlist.title}](${playlist.url})** has been added to the queue.`
        )
        .setThumbnail(playlist.thumbnail)
        .setFooter({ text: `Duration: ${playlist.duration}` })
    } else if (commandType == 'search') {
      /*
        Search CommandType
        search parameters: QueryType.YOUTUBE_PLAYLIST
      */
      let url = interaction.options.getString('keywords')
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })

      if (result.tracks.length === 0)
        return interaction.editReply('No results found')

      const song = result.tracks[0]
      await queue.addTracks(song)
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the queue.`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` })
    }
    if (!queue.playing) await queue.play()
    await interaction.editReply({
      embeds: [embed],
    })
  },
}
