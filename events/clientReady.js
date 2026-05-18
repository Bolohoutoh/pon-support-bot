const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Success! Bot ${client.user.tag} is online & ready!`);
        client.user.setActivity({
            type: ActivityType.Custom,
            name: 'custom',
            state: 'Support, 24/7'
        });
    }
};
