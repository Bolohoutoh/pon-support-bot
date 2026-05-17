const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'ticket',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return message.reply('❌ Only Outpost Commanders (Admins) can deploy the ticket system!');
        return this.deployTicketSystem(message);
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        if (!isRealAdmin && !isCustomAdmin) return interaction.reply({ content: '❌ Only Outpost Commanders can deploy this!', ephemeral: true });
        return this.deployTicketSystem(interaction);
    },

    async deployTicketSystem(ctx) {
        const isSlash = !!ctx.commandName;

        // Mengambil Icon Server otomatis. 
        // Jika server tidak punya icon, dia akan memakai GIF Dino sebagai cadangan.
        const serverIcon = ctx.guild.iconURL({ dynamic: true, size: 512 }) || 'https://i.imgur.com/5VR57Rc.gif';

        const embed = new EmbedBuilder()
            .setColor('#2F3136') // Warna abu-abu elegan menyatu dengan Discord
            .setTitle('SUPPORT TICKET🔒')
            .setDescription('Welcome to the Support Desk. Please review the protocols before firing a distress signal.\n\n**BEFORE YOU DEPLOY A TICKET:**\n❌ - Ensure your issue hasn\'t been answered in `#faq` or `#guidelines`.\n❌ - Do not misuse this beacon. False alarms (trolling) will result in immediate exile to the wild.\n\n**EMERGENCY TYPES:**\n1️⃣ : Bug / System Anomaly\n2️⃣ : Report a Rogue Pioneer (Player)\n3️⃣ : Appeal Exile (Ban Appeal)\n4️⃣ : General Outpost Support\n\n*An Outpost Commander will respond as soon as the perimeter is secure.*')
            .setThumbnail(serverIcon); // Memasang icon server di sini

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_menu')
            .setPlaceholder('Choose a ticket type...')
            .addOptions([
                { label: 'Bug / Anomaly', description: 'Report a glitch or bug in the system.', value: 'bug', emoji: '🐛' },
                { label: 'Report Pioneer', description: 'Report a player breaking the rules.', value: 'report', emoji: '⚠️' },
                { label: 'Appeal Exile', description: 'Appeal a ban, mute, or warning.', value: 'appeal', emoji: '⚖️' },
                { label: 'General Support', description: 'Need help with something else?', value: 'general', emoji: '🏕️' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        if (isSlash) {
            await ctx.reply({ embeds: [embed], components: [row] });
        } else {
            // Untuk menghapus pesan komando admin agar rapi
            if (ctx.deletable) await ctx.delete().catch(() => {});
            await ctx.channel.send({ embeds: [embed], components: [row] });
        }
    }
};
