const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'rmv',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { return this.handleDelete(message, args, 'PREFIX', isCustomAdmin); },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) { return this.handleDelete(interaction, null, 'SLASH', isCustomAdmin); },

    async handleDelete(ctx, args, type, isCustomAdmin) {
        const isSlash = type === 'SLASH';
        const guild = ctx.guild;
        const hasChannelPerms = ctx.member ? ctx.member.permissions.has(PermissionFlagsBits.ManageChannels) : false;
        
        if (!hasChannelPerms && !isCustomAdmin) return ctx.reply('❌ No permission!');

        const sub = isSlash ? ctx.options.getSubcommand() : (args[0] ? args[0].toLowerCase() : null);

        if (sub === 'msg') {
            const num = isSlash ? ctx.options.getInteger('amount') : parseInt(args[1]);
            if (isNaN(num) || num < 1 || num > 100) return ctx.reply('❌ Please provide a number between 1 and 100.');
            try {
                // Hapus +1 untuk prefix agar menghapus pesan "pon rmv msg" itu sendiri
                const deleteCount = isSlash ? num : num + 1;
                await ctx.channel.bulkDelete(deleteCount, true);
                if (isSlash) return ctx.reply({ content: `✅ Deleted ${num} messages.`, ephemeral: true });
                else {
                    const msg = await ctx.channel.send(`✅ Deleted ${num} messages.`);
                    setTimeout(() => msg.delete().catch(()=>{}), 3000);
                    return;
                }
            } catch (err) { return ctx.reply('❌ Failed. Cannot delete messages older than 14 days.'); }
        }

        if (sub === 'role') {
            const role = isSlash ? ctx.options.getRole('role') : ctx.mentions?.roles?.first();
            if (!role) return ctx.reply('❌ Please tag the role to delete! Example: `pon rmv role @Player`');
            const roleName = role.name;
            try {
                await role.delete();
                return ctx.reply(`✅ Successfully deleted role: **${roleName}**`);
            } catch (err) { return ctx.reply('❌ Failed. Is the bot role higher than the target role?'); }
        }

        if (sub === 'cha') {
            let channelToDelete = isSlash ? ctx.options.getChannel('channel') : ctx.mentions?.channels?.first();
            if (!isSlash && !channelToDelete && args[1]) {
                let nameArg = args.slice(1).join(' ');
                if (nameArg.startsWith('#')) nameArg = nameArg.slice(1);
                channelToDelete = guild.channels.cache.find(c => c.name.toLowerCase() === nameArg.toLowerCase() && c.type === ChannelType.GuildText);
            }
            if (!channelToDelete) return ctx.reply('❌ Channel not found!');
            try {
                const chanName = channelToDelete.name;
                await channelToDelete.delete();
                return ctx.reply(`✅ Successfully deleted text channel: **${chanName}**`);
            } catch (err) { return ctx.reply('❌ Failed to delete.'); }
        }

        if (sub === 'cat') {
            const nameArg = isSlash ? ctx.options.getString('name') : args.slice(1).join(' ');
            if (!nameArg) return ctx.reply('❌ Missing category name!');
            const catToDelete = guild.channels.cache.find(c => c.name.toLowerCase() === nameArg.toLowerCase() && c.type === ChannelType.GuildCategory);
            if (!catToDelete) return ctx.reply(`❌ Category **${nameArg}** not found!`);
            try {
                const catName = catToDelete.name;
                await catToDelete.delete();
                return ctx.reply(`✅ Successfully deleted category: **${catName}**`);
            } catch (err) { return ctx.reply('❌ Failed to delete.'); }
        }
    }
};
