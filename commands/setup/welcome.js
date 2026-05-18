const { EmbedBuilder } = require('discord.js');
const { saveSettings } = require('../../utils/database');
const { DEFAULT_GIFS } = require('../../utils/welcome');

module.exports = {
    name: 'wcm',

    async executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        return this.manageWcm(message, args, 'PREFIX', settings, isRealAdmin, isCustomAdmin);
    },
    async executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin) {
        return this.manageWcm(interaction, null, 'SLASH', settings, isRealAdmin, isCustomAdmin);
    },

    async manageWcm(ctx, args, type, settings, isRealAdmin, isCustomAdmin) {
        const isSlash = type === 'SLASH';
        const guildId = ctx.guild.id;

        if (!isRealAdmin && !isCustomAdmin) {
            return isSlash ? ctx.reply({ content: '❌ No permission!', ephemeral: true }) : ctx.reply('❌ No permission!');
        }

        const sub = isSlash ? ctx.options.getSubcommand() : (args[0] ? args[0].toLowerCase() : null);
        let currentGifs = [...DEFAULT_GIFS];
        if (settings[guildId].gifs && settings[guildId].gifs.length > 0) currentGifs = settings[guildId].gifs;

        // A. TAMBAH GIF
        if (sub === 'gif') {
            const link = isSlash ? ctx.options.getString('link') : args[1];
            if (!link || !link.toLowerCase().includes('imgur.com')) return ctx.reply('❌ Please provide a valid Imgur link!');

            let directLink = link;
            if (!directLink.toLowerCase().includes('i.imgur.com')) {
                directLink = directLink.replace(/https?:\/\/(www\.)?imgur\.com/, 'https://i.imgur.com');
                if (!directLink.toLowerCase().endsWith('.gif')) directLink += '.gif';
            }

            if (currentGifs.length >= 5) return ctx.reply('❌ Limit of 5 GIFs reached!');
            currentGifs.push(directLink);
            settings[guildId].gifs = currentGifs;
            saveSettings(settings);
            return ctx.reply(`✅ Added GIF (${currentGifs.length}/5)!`);
        }

        // B. LIST GIF
        if (sub === 'list') {
            const embed = new EmbedBuilder().setTitle('🖼️ Welcome GIFs List').setDescription(currentGifs.map((gif, i) => `**${i + 1}.** ${gif}`).join('\n'));
            return ctx.reply({ embeds: [embed] });
        }

        // C. HAPUS GIF
        if (sub === 'rmv') {
            const num = isSlash ? ctx.options.getInteger('number') : parseInt(args[1]);
            if (isNaN(num) || num < 1 || num > currentGifs.length) return ctx.reply('❌ Invalid GIF number!');
            if (currentGifs.length === 1) return ctx.reply('❌ Min 1 GIF required!');

            currentGifs.splice(num - 1, 1);
            settings[guildId].gifs = currentGifs;
            saveSettings(settings);
            return ctx.reply(`✅ Removed GIF #${num}!`);
        }
    }
};
