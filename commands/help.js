const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'help',
    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        await this.sendHelpMenu(message, message.author.id);
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        await this.sendHelpMenu(interaction, interaction.user.id);
    },

    async sendHelpMenu(ctx, userId) {
        const isSlash = !!ctx.commandName;

        // 1. DAFTAR HALAMAN (ARRAY OF EMBEDS)
        const pages = [
            new EmbedBuilder()
                .setTitle('📜 Bot Command List | Page 1')
                .setDescription('**🛠️ CHANNEL MANAGEMENT**\nManage your server channels, roles, and moderation.')
                .addFields(
                    {
                        name: 'Prefix / Slash',
                        value: '`crt cha [name]` / `/crt cha`\nCreate text channel\n\n`crt cat [name]` / `/crt cat`\nCreate category\n\n`crt in [CatID] [name]` / `/crt in`\nCreate channel in category\n\n`rmv cha [#channel/name]` / `/rmv cha`\nDelete text channel\n\n`rmv cat [name]` / `/rmv cat`\nDelete category\n\n`rmv msg [num]` / `/rmv msg`\nDelete multiple messages\n\n`crt role [hex] [name]` / `/crt role`\nCreate a role\n\n`rmv role [@role]` / `/rmv role`\nDelete a role\n\n`lock [#channel]` / `/lock`\nLock a channel\n\n`unlock [#channel]` / `/unlock`\nUnlock a channel\n\n`slowmode [#channel] [sec]` / `/slowmode`\nSet channel slowmode'
                    }
                )
                .setFooter({ text: 'Page 1 of 4 • Channel Management' }),

            new EmbedBuilder()
                .setTitle('📜 Bot Command List | Page 2')
                .setDescription('**👋 WELCOME & SYSTEM SETUP**\nSetup automatic welcome messages, logs, and suggestions.')
                .addFields(
                    {
                        name: 'Prefix / Slash',
                        value: '`set wcm [#channel]` / `/set wcm`\nSet welcome channel\n\n`set log [#channel]` / `/set log`\nSet ticket log channel\n\n`set sug [#channel]` / `/set sug`\nSet suggestion post target channel\n\n`wcm gif [link]` / `/wcm gif`\nAdd custom GIF (Max 5)\n\n`wcm list gif` / `/wcm list`\nList custom GIFs\n\n`wcm rmv gif [num]` / `/wcm rmv`\nRemove a GIF'
                    }
                )
                .setFooter({ text: 'Page 2 of 4 • Welcome & System Setup' }),

            new EmbedBuilder()
                .setTitle('📜 Bot Command List | Page 3')
                .setDescription('**🛡️ BOT ACCESS (Admin Only)**\nGrant or revoke bot command access to your trusted staff.')
                .addFields(
                    {
                        name: 'Prefix / Slash',
                        value: '`access add [@user]` / `/access add`\nGrant access\n\n`access rmv [@user]` / `/access rmv`\nRevoke access\n\n`access list` / `/access list`\nView authorized admins'
                    }
                )
                .setFooter({ text: 'Page 3 of 4 • Bot Access' }),

            new EmbedBuilder()
                .setTitle('📜 Bot Command List | Page 4')
                .setDescription('**⚙️ UTILITIES & SUPPORT**\nGeneral bot information and support ticket system.')
                .addFields(
                    {
                        name: 'Prefix / Slash',
                        value: '`info` / `/info`\nView bot statistics and ping\n\n`ticket` / `/ticket`\nDeploy Support Ticket panel\n\n`suggestion` / `/suggestion`\nDeploy Suggestion panel'
                    }
                )
                .setFooter({ text: 'Page 4 of 4 • Utilities' })
        ];

        let currentPage = 0;

        // 2. FUNGSI UNTUK MEMBUAT TOMBOL
        const getButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel('◀ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages.length - 1)
            );
        };

        // 3. KIRIM PESAN AWAL (HALAMAN 1)
        const initialMessage = await ctx.reply({
            embeds: [pages[currentPage]],
            components: [getButtons(currentPage)],
            fetchReply: true
        });

        // 4. BUAT COLLECTOR (Pengawas Tombol Aktif 60 Detik)
        const collector = initialMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: '❌ Hey! You cannot use these buttons. Type `pon help` yourself!', ephemeral: true });
            }

            if (interaction.customId === 'prev_page') currentPage--;
            else if (interaction.customId === 'next_page') currentPage++;

            await interaction.update({
                embeds: [pages[currentPage]],
                components: [getButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev_page').setLabel('◀ Previous').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('next_page').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );
            initialMessage.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
