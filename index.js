const Discord = require('discord.js')
const dotenv = require('dotenv')
const { REST } = require('@discord-js/rest')
const { Routes } = require('@discord-api-types/v9')
const fs = require('fs')
const { Player } = require('discord-player')

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == 'load'

const CLIENT_ID = ''
const GUILD_ID = ''

const client = new Discord.client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES'],
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
})

let commands = []

const slashFiles = fs
  .readdirSync('./slash')
  .filter((file) => file.endsWith('.js'))

for (let file of slashFiles) {
  const slashcmd = require('./slash/${file}')
  client.slashcommands.set(slashcmd.data.name, slashcmd)
  if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
  const rest = new REST({ version: '9' }).setToken(TOKEN)
  console.log('Deploying slash')
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { commands })
    .then(() => {
      console.log('REST API loaded')
      process.exit(0)
    })
    .catch((err) => {
      if (err) {
        console.log(err)
        process.exit(1)
      }
    })
} else {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
  })
  client.on('interactionCreate', (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return

      const slashcmd = client.slashcommands.get(interaction.commandName)
      if (!slashcmd) interaction.reply('Not a valid slash command')

      await interaction.deferReply()
      await slashcmd.run({ client, interaction })
    }
    handleCommand()
  })
  client.login(TOKEN)
}
