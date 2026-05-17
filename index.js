require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits, Collection, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = 'pon';
const SETTINGS_FILE = './serverSettings.json';
const AFK_FILE = './afk.json'; // Database baru untuk AFK

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) client.commands.set(command.name, command);
}

if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}));
if (!fs.existsSync(AFK_FILE)) fs.writeFileSync(AFK_FILE, JSON.stringify({}));

client.once('clientReady', () => {
    console.log(`Success! Bot ${client.user.tag} is online & ready!`);
    client.user.setActivity({
        type: ActivityType.Custom,
        name: 'custom',
        state: 'Support, 24/7'
    });
});

const welcomeHandler = require('./commands/welcome.js');
client.on('guildMemberAdd', async member => {
    if (welcomeHandler.handleWelcome) await welcomeHandler.handleWelcome(member, SETTINGS_FILE);
});

function checkDatabase(guildId) {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    let changed = false;
    if (!settings[guildId] || typeof settings[guildId] === 'string') {
        settings[guildId] = { channelId: typeof settings[guildId] === 'string' ? settings[guildId] : null, gifs: [], authorizedUsers: [], logChannelId: null, suggestionChannelId: null };
        changed = true;
    }
    if (!Array.isArray(settings[guildId].authorizedUsers)) {
        settings[guildId].authorizedUsers = [];
        changed = true;
    }
    if (settings[guildId].logChannelId === undefined) {
        settings[guildId].logChannelId = null;
        changed = true;
    }
    if (settings[guildId].suggestionChannelId === undefined) {
        settings[guildId].suggestionChannelId = null;
        changed = true;
    }
    if (changed) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return settings;
}

// ==================== INTERACTION HANDLER ====================
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
        const reason = interaction.values[0];
        const member = interaction.member;
        const guild = interaction.guild;

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${member.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });
            await interaction.reply({ content: `✅ Signal received! Head over to your private channel: ${ticketChannel}`, ephemeral: true });

            const ticketEmbed = new EmbedBuilder()
                .setColor('#77B255')
                .setTitle('🏕️ DISTRESS SIGNAL OPENED')
                .setDescription(`Welcome to your private channel, <@${member.id}>.\n\n**Category:** ${reason.toUpperCase()}\n\nPlease describe your issue clearly and provide any evidence/screenshots if needed. An Outpost Commander will be with you shortly.`)
                .setFooter({ text: 'Press the lock button below to close this ticket.' });

            const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket & Save Log').setStyle(ButtonStyle.Danger).setEmoji('🔒');
            const btnRow = new ActionRowBuilder().addComponents(closeBtn);

            await ticketChannel.send({ content: `<@${member.id}>`, embeds: [ticketEmbed], components: [btnRow] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to deploy ticket channel!', ephemeral: true });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        try {
            await interaction.reply('🔒 Securing data logs and dismantling channel in 5 seconds...');
            const channel = interaction.channel;
            const guildId = interaction.guild.id;
            const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            const logChannelId = settings[guildId]?.logChannelId;

            const messages = await channel.messages.fetch({ limit: 100 });
            const transcriptArray = Array.from(messages.values()).reverse().map(m => {
                const d = new Date(m.createdTimestamp);
                const safeDate = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
                return `[${safeDate}] ${m.author.tag}: ${m.content} ${m.attachments.size > 0 ? '(Attachment Included)' : ''}`;
            });

            const transcriptText = transcriptArray.join('\n');
            const buffer = Buffer.from(transcriptText, 'utf8');
            const attachment = new AttachmentBuilder(buffer, { name: `${channel.name}-log.txt` });

            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const embedLog = new EmbedBuilder().setColor('#2F3136').setTitle('🎫 TICKET CLOSED & LOGGED').setDescription(`**Ticket:** ${channel.name}\n**Closed By:** <@${interaction.user.id}>`).setTimestamp();
                    await logChannel.send({ embeds: [embedLog], files: [attachment] });
                }
            }
            setTimeout(() => { channel.delete().catch(console.error); }, 5000);
        } catch (err) {
            console.error(err);
            await interaction.followUp({ content: '❌ Error closing ticket.', ephemeral: true }).catch(()=>{});
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'create_suggestion') {
        const modal = new ModalBuilder().setCustomId('suggestion_modal').setTitle('Submit a Suggestion');
        const suggestionInput = new TextInputBuilder().setCustomId('suggestion_text').setLabel("What is your idea?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
        modal.addComponents(new ActionRowBuilder().addComponents(suggestionInput));
        await interaction.showModal(modal);
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'suggestion_modal') {
        const suggestionText = interaction.fields.getTextInputValue('suggestion_text');
        const guildId = interaction.guild.id;
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        const targetChannelId = settings[guildId]?.suggestionChannelId;
        const targetChannel = targetChannelId ? interaction.guild.channels.cache.get(targetChannelId) : interaction.channel;

        if (!targetChannel) return interaction.reply({ content: '❌ Target channel error!', ephemeral: true });

        const suggestionEmbed = new EmbedBuilder().setColor('#FEE75C').setAuthor({ name: `${interaction.user.tag} suggests:`, iconURL: interaction.user.displayAvatarURL() }).setDescription(`**Suggestion:**\n${suggestionText}`).setTimestamp().setFooter({ text: 'Vote below! ⬆️ for Yes, ⬇️ for No' });

        try {
            const suggestionMsg = await targetChannel.send({ embeds: [suggestionEmbed] });
            await suggestionMsg.react('⬆️');
            await suggestionMsg.react('⬇️');
            if (interaction.message) await interaction.message.delete().catch(() => {});

            const panelEmbed = new EmbedBuilder().setColor('#2F3136').setTitle('💡 PIONEER IDEAS & SUGGESTIONS').setDescription('Have a thought that could make **Pioneer Outpost Nusa** even greater? Share it with the community!\n\n• Click the button below to submit your suggestion.\n• The community can vote using ⬆️ and ⬇️ reactions.\n• Highly voted ideas will be reviewed and possibly implemented by the Outpost Commanders.\n\n*Help us build a better world!*').setImage('https://i.imgur.com/feJtRAt.gif');
            const btn = new ButtonBuilder().setCustomId('create_suggestion').setLabel('CREATE SUGGESTION').setStyle(ButtonStyle.Primary).setEmoji('📝');
            await interaction.channel.send({ embeds: [panelEmbed], components: [new ActionRowBuilder().addComponents(btn)] });
            await interaction.reply({ content: `✅ Your suggestion has been sent to ${targetChannel}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to submit suggestion.', ephemeral: true }).catch(()=>{});
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const settings = checkDatabase(interaction.guild.id);
    const isRealAdmin = interaction.member ? interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) : false;
    const isCustomAdmin = settings[interaction.guild.id].authorizedUsers.includes(interaction.user.id);

    try { await command.executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin); }
    catch (error) { console.error(error); }
});

// ==================== MESSAGE HANDLER & AFK SYSTEM ====================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    let afkData = JSON.parse(fs.readFileSync(AFK_FILE, 'utf8'));
    let afkChanged = false;

    // 1. Cek jika member yang AFK mulai nge-chat (Hapus AFK-nya tanpa mode reply)
    if (afkData[guildId] && afkData[guildId][message.author.id]) {
        delete afkData[guildId][message.author.id];
        afkChanged = true;
        // Diubah menggunakan channel.send biasa
        message.channel.send(`👋 Welcome back **${message.member.displayName}**, I removed your AFK.`)
            .then(msg => setTimeout(() => msg.delete().catch(()=>{}), 5000));
    }

    // 2. Cek jika pesan ini me-mention (tag) orang yang sedang AFK (Tanpa mode reply)
    if (message.mentions.users.size > 0 && afkData[guildId]) {
        message.mentions.users.forEach(user => {
            if (afkData[guildId][user.id]) {
                const afkInfo = afkData[guildId][user.id];
                const timeAgo = Math.floor(afkInfo.timestamp / 1000);
                // Diubah menggunakan channel.send biasa
                message.channel.send(`💤 **${user.username}** is AFK: ${afkInfo.reason} *(since <t:${timeAgo}:R>)*`);
            }
        });
    }

    // Simpan perubahan ke afk.json jika ada yang dihapus
    if (afkChanged) fs.writeFileSync(AFK_FILE, JSON.stringify(afkData, null, 2));

    // Eksekusi Prefix Command biasa
    const originalTrimmed = message.content.trim();
    const contentLower = originalTrimmed.toLowerCase();
    if (!contentLower.startsWith(PREFIX.toLowerCase())) return;

    const args = originalTrimmed.slice(PREFIX.length).trim().split(/\s+/);
    if (args.length === 0) return;
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    const settings = checkDatabase(message.guild.id);
    const isRealAdmin = message.member ? message.member.permissions.has(PermissionFlagsBits.ManageGuild) : false;
    const isCustomAdmin = settings[message.guild.id].authorizedUsers.includes(message.author.id);

    // 🔥 TRIK PEMBAJAKAN UTAMA: Mengubah semua .reply di file commands/ menjadi channel.send otomatis khusus tipe Prefix
    message.reply = (content) => message.channel.send(content);

    try { await command.executePrefix(message, args, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin); }
    catch (error) { console.error(error); }
});

client.login(process.env.TOKEN);
