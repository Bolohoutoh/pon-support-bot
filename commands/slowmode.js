module.exports = {
    name: 'slowmode',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return message.reply('❌ No permission!');
        
        let channel = message.mentions.channels.first();
        // Kalau channel di-tag, waktu ada di args[1]. Kalau tidak di-tag (pakai channel saat ini), waktu di args[0]
        let timeRaw = channel ? args[1] : args[0];
        if (!channel) channel = message.channel;

        let seconds = parseInt(timeRaw);
        if (isNaN(seconds)) return message.reply('❌ Example: `pon slowmode #channel 10` or `pon slowmode 10` (for current channel)');
        
        try {
            await channel.setRateLimitPerUser(seconds);
            return message.reply(`⏳ Slowmode for ${channel} is now set to **${seconds} seconds**.`);
        } catch (err) { return message.reply('❌ Failed to set slowmode.'); }
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return interaction.reply({ content: '❌ No permission!', ephemeral: true });
        
        const channel = interaction.options.getChannel('channel');
        const seconds = interaction.options.getInteger('seconds');

        try {
            await channel.setRateLimitPerUser(seconds);
            return interaction.reply(`⏳ Slowmode for ${channel} is now set to **${seconds} seconds**.`);
        } catch (err) { return interaction.reply('❌ Failed to set slowmode.'); }
    }
};
