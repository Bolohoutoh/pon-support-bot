const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkDatabase } = require('../utils/database');

/**
 * Handler tombol close_ticket — menyimpan transcript & menghapus channel ticket.
 */
module.exports = async function closeTicket(interaction) {
    try {
        const channel = interaction.channel;

        // Hanya pembuat ticket atau admin yang bisa close
        const isTicketOwner = channel.name.includes(interaction.user.username.toLowerCase());
        const isAdmin = interaction.member.permissions.has('ManageChannels');
        if (!isTicketOwner && !isAdmin) {
            return interaction.reply({ content: '❌ Only the ticket creator or an admin can close this ticket.', ephemeral: true });
        }

        await interaction.reply('🔒 Securing data logs and dismantling channel in 5 seconds...');
        const guildId = interaction.guild.id;
        const settings = checkDatabase(guildId);
        const logChannelId = settings[guildId]?.logChannelId;

        const messages = await channel.messages.fetch({ limit: 100 });
        const transcriptArray = Array.from(messages.values()).reverse().map(m => {
            const d = new Date(m.createdTimestamp);
            const safeDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
            return `[${safeDate}] ${m.author.tag}: ${m.content} ${m.attachments.size > 0 ? '(Attachment Included)' : ''}`;
        });

        const transcriptText = transcriptArray.join('\n');
        const buffer = Buffer.from(transcriptText, 'utf8');
        const attachment = new AttachmentBuilder(buffer, { name: `${channel.name}-log.txt` });

        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const embedLog = new EmbedBuilder()
                    .setColor('#2F3136')
                    .setTitle('🎫 TICKET CLOSED & LOGGED')
                    .setDescription(`**Ticket:** ${channel.name}\n**Closed By:** <@${interaction.user.id}>`)
                    .setTimestamp();
                await logChannel.send({ embeds: [embedLog], files: [attachment] });
            }
        }
        setTimeout(() => { channel.delete().catch(console.error); }, 5000);
    } catch (err) {
        console.error(err);
        await interaction.followUp({
            content: '❌ Error closing ticket.',
            ephemeral: true
        }).catch(() => {});
    }
};
