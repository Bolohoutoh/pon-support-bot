require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents }   = require('./handlers/eventHandler');
const { initDatabase } = require('./utils/database');

// Tangkap error yang tidak ter-handle agar bot tidak crash diam-diam
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

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
