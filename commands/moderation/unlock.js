const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unlock',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { return this.handleUnlock(message, args[0], 'PREFIX', isRealAdmin, isCustomAdmin); },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { return this.handleUnlock(interaction, interaction.options.getChannel('channel'), 'SLASH', isRealAdmin, isCustomAdmin); },

    async handleUnlock(ctx, targetChannelInput, type, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return ctx.reply('❌ No permission!');

        const isSlash = type === 'SLASH';
        let channel = isSlash ? targetChannelInput : (ctx.mentions?.channels?.first() || ctx.channel);
        if (!channel) channel = ctx.channel;

        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, { SendMessages: null });
            return ctx.reply(`🔓 **${channel} is now UNLOCKED.** Everyone can speak.`);
        } catch (err) { return ctx.reply('❌ Failed to unlock.'); }
    }
};
