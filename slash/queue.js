const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays current songs queue.')
    .addNumberOption((option) =>
      option
        .setName('page')
        .setDescription('Page # of queue list.')
        .setMinValue(1)
    ),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue || !queue.playing) {
      return await interaction.editReply('The queue is empty.')
    }

    // round up number of pages, 10 tracks each
    const totalPages = Math.ceil(queue.tracks.length / 10) || 1
    const page = (interaction.options.getNumber('page') || 1) - 1
  },
}
