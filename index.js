require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents }   = require('./handlers/eventHandler');
const { initDatabase } = require('./utils/database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

loadCommands(client);
loadEvents(client);
initDatabase();

client.login(process.env.TOKEN);
