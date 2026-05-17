const fs = require('fs');

module.exports = {
    name: 'set',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return message.reply('❌ No permission!');

        const sub = args[0] ? args[0].toLowerCase() : null;

        // Set Welcome Channel
        if (sub === 'wcm') {
            const chan = message.mentions.channels.first();
            if (!chan) return message.reply('❌ Please mention a channel! Example: `pon set wcm #channel`');
            settings[message.guild.id].channelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return message.reply(`✅ Success! Welcome target set to ${chan}`);
        }

        // Set Log Channel (UNTUK TICKET TRANSCRIPT)
        if (sub === 'log') {
            const chan = message.mentions.channels.first();
            if (!chan) return message.reply('❌ Please mention a channel! Example: `pon set log #admin-logs`');
            settings[message.guild.id].logChannelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return message.reply(`✅ Success! Ticket transcripts will now be sent to ${chan}`);
        }

        // Set Suggestion Channel (UNTUK POSTINGAN IDE MEMBER)
        if (sub === 'sug') {
            const chan = message.mentions.channels.first();
            if (!chan) return message.reply('❌ Please mention a channel! Example: `pon set sug #vote-saran`');
            settings[message.guild.id].suggestionChannelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return message.reply(`✅ Success! Suggestion posts will now be sent to ${chan}`);
        }

        return message.reply('❌ Invalid command! Use `wcm`, `log`, or `sug`.');
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return interaction.reply({ content: '❌ No permission!', ephemeral: true });

        const sub = interaction.options.getSubcommand();

        if (sub === 'wcm') {
            const chan = interaction.options.getChannel('channel');
            settings[interaction.guild.id].channelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return interaction.reply(`✅ Success! Welcome target set to ${chan}`);
        }

        if (sub === 'log') {
            const chan = interaction.options.getChannel('channel');
            settings[interaction.guild.id].logChannelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return interaction.reply(`✅ Success! Ticket transcripts will now be sent to ${chan}`);
        }

        if (sub === 'sug') {
            const chan = interaction.options.getChannel('channel');
            settings[interaction.guild.id].suggestionChannelId = chan.id;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return interaction.reply(`✅ Success! Suggestion posts will now be sent to ${chan}`);
        }
    }
};
