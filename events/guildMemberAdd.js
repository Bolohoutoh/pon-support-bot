const { Events } = require('discord.js');
const { sendWelcome } = require('../utils/welcome');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        await sendWelcome(member);
    }
};
