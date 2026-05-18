const { Events } = require('discord.js');
const welcomeHandler = require('../commands/setup/welcome.js');
const { SETTINGS_FILE } = require('../config');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (welcomeHandler.handleWelcome) {
            await welcomeHandler.handleWelcome(member, SETTINGS_FILE);
        }
    }
};
