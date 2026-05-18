const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lock',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { 
        return this.handleLock(message, args[0], 'PREFIX', settings, isRealAdmin, isCustomAdmin); 
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { 
        return this.handleLock(interaction, interaction.options.getChannel('channel'), 'SLASH', settings, isRealAdmin, isCustomAdmin); 
    },

    async handleLock(ctx, targetChannelInput, type, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return ctx.reply('❌ No permission!');

        const isSlash = type === 'SLASH';
        let channel = isSlash ? targetChannelInput : (ctx.mentions?.channels?.first() || ctx.channel);
        if (!channel) channel = ctx.channel;

        try {
            // 1. Kunci untuk Everyone (Tahap ini yang berhasil)
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, { SendMessages: false });
            
            // 2. Berikan akses bypass ke Admin Kustom (Dengan pelindung error)
            const authUsers = settings[channel.guild.id].authorizedUsers;
            for (const userId of authUsers) {
                try {
                    await channel.permissionOverwrites.edit(userId, { SendMessages: true });
                } catch (bypassError) {
                    // Kalau gagal memberi akses ke 1 orang (misal user sudah left), abaikan dan lanjut
                    console.error(`Bypass failed for user ${userId}`);
                }
            }

            // 3. Kirim pesan sukses!
            return ctx.reply(`🔒 **${channel} is now LOCKED.** Only Authorized Admins can speak.`);
        } catch (err) { 
            return ctx.reply('❌ Failed to lock the channel. Make sure the bot has `Manage Channels` permission and is placed high in the role hierarchy.'); 
        }
    }
};
