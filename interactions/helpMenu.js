const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { PREFIX, EMOJIS_FILE } = require('../config');

/**
 * Handler dropdown help_menu — render konten help sesuai kategori yang dipilih.
 */
module.exports = async function helpMenu(interaction) {
    const selection = interaction.values[0];
    const embed = new EmbedBuilder().setTimestamp();
    const p = PREFIX;

    let emojis = {
        help_main: '🏕️', help_general: '🧭', help_profile: '👤',
        help_management: '🧱', help_support: '🛠️'
    };
    if (fs.existsSync(EMOJIS_FILE)) {
        emojis = JSON.parse(fs.readFileSync(EMOJIS_FILE, 'utf8'));
    }

    const getEmoji = (emojiStr, fallback) => {
        const match = emojiStr.match(/\d+/);
        if (match && interaction.guild) {
            const guildEmoji = interaction.guild.emojis.cache.get(match[0]);
            if (guildEmoji) return guildEmoji.toString();
        }
        return fallback;
    };

    switch (selection) {
        case 'help_main':
            embed.setColor('#2F3136')
                .setTitle('🏕️ PIONEER OUTPOST HELP PANEL')
                .setDescription('Welcome Explorer! Select a category from the dropdown menu below to view available commands and server configurations.')
                .addFields(
                    { name: `${emojis.help_general || '🧭'} General`, value: 'Basic bot interactions, user utilities, and AFK systems.', inline: true },
                    { name: `${emojis.help_profile || '👤'} Profile`, value: 'View player statistics, titles, badges, gamble and games. *(Coming Soon)*', inline: true },
                    { name: `${emojis.help_management || '🧱'} Ch Management & Welcome`, value: 'Tools for channel, role, locks, custom greetings, logs, and suggestions.', inline: true },
                    { name: `${emojis.help_support || '🛠️'} Support & Utilities`, value: 'Configure custom bot access and administrator rights.', inline: true }
                )
                .setFooter({ text: 'Pioneer Support • Choose a category below' });
            break;

        case 'help_general':
            embed.setColor('#2F3136')
                .setTitle(`${getEmoji(emojis.help_general, '🧭')} GENERAL BOT COMMANDS`)
                .setDescription('Here are the basic commands available for all server members:')
                .addFields(
                    { name: `\`${p} afk [reason]\``, value: 'Set your status to Away From Keyboard (AFK).' },
                    { name: `\`${p} info\``, value: 'View bot statistics, current ping, and system uptime.' },
                    { name: `\`${p} avatar [user]\``, value: 'Display your own or another member\'s high-resolution avatar.' },
                    { name: `\`${p} vote\``, value: 'Support our outpost by voting for the bot on community lists.' },
                    { name: `\`${p} dog / cat\``, value: 'Summon a random cute dog or cat image.' },
                    { name: `\`${p} meme\``, value: 'Get a random fresh meme from Reddit.' }
                )
                .setFooter({ text: 'Category: General Commands' });
            break;

        case 'help_profile':
            embed.setColor('#2F3136')
                .setTitle(`${getEmoji(emojis.help_profile, '👤')} PLAYER PROFILE SYSTEM`)
                .setDescription('📋 **STATUS: COMING SOON**\n\nThis feature is currently under heavy development by the Outpost Commanders.\n\nSoon you will be able to earn customized **Badges**, unlock legendary **Titles**, level up by chatting, and compete on the global server **Leaderboard**!')
                .setFooter({ text: 'Category: Profile & Ranks' });
            break;

        case 'help_management':
            embed.setColor('#2F3136')
                .setTitle(`${getEmoji(emojis.help_management, '🧱')} CH MANAGEMENT & WELCOME SETUP`)
                .setDescription('Configuration commands to control, structure channels, setup greetings, and logs:')
                .addFields(
                    { name: '🧱 Channel & Role Management', value: `\`${p} crt cha [name]\` - Create text channel.\n\`${p} crt cat [name]\` - Create category folder.\n\`${p} crt role [hex] [name]\` - Create custom colored role.\n\`${p} rmv [cha/cat/role]\` - Delete channel/category/role.\n\`${p} rmv msg [amount]\` - Clear chat messages.\n\`${p} lock / unlock [channel]\` - Toggle channel locks.\n\`${p} slowmode [channel] [seconds]\` - Set slowmode cooldown.` },
                    { name: '👋 Welcome Greeting Configurations', value: `\`${p} set wcm [#channel]\` - Set target welcome channel.\n\`${p} wcm gif [imgur_link]\` - Pool custom background Imgur GIF.\n\`${p} wcm list\` - View registered welcome GIFs.\n\`${p} wcm rmv [num]\` - Remove custom GIF from database.` },
                    { name: '📝 Ticket & Suggestion Logs', value: `\`${p} set log [#channel]\` - Set archive log channel for closed tickets.\n\`${p} set sug [#channel]\` - Set community suggestion channel.\n\`${p} suggestion\` - Deploy Suggestion Embed Panel.` }
                )
                .setFooter({ text: 'Category: Management & Welcome (Admin Only)' });
            break;

        case 'help_support':
            embed.setColor('#2F3136')
                .setTitle(`${getEmoji(emojis.help_support, '🛠️')} SUPPORT & UTILITIES PANEL`)
                .setDescription('Core configuration tools for advanced bot access modules:')
                .addFields(
                    { name: `\`${p} access add / rmv [@user]\``, value: 'Grant or revoke custom admin permissions to run bot commands.' },
                    { name: `\`${p} access list\``, value: 'Display all authorized custom bot administrators.' }
                )
                .setFooter({ text: 'Category: Support & Utilities (Admin Only)' });
            break;
    }

    await interaction.update({ embeds: [embed] });
};
