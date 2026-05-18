const {
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    PermissionFlagsBits, ChannelType
} = require('discord.js');

/**
 * Handler untuk dropdown ticket_menu — membuat private channel ticket
 * untuk user yang memilih kategori.
 */
module.exports = async function ticketMenu(interaction, client) {
    const reason = interaction.values[0];
    const member = interaction.member;
    const guild  = interaction.guild;

    try {
        const ticketChannel = await guild.channels.create({
            name: `ticket-${member.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                {
                    id: member.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        await interaction.reply({
            content: `✅ Signal received! Head over to your private channel: ${ticketChannel}`,
            ephemeral: true
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#77B255')
            .setTitle('🏕️ DISTRESS SIGNAL OPENED')
            .setDescription(
                `Welcome to your private channel, <@${member.id}>.\n\n` +
                `**Category:** ${reason.toUpperCase()}\n\n` +
                `Please describe your issue clearly and provide any evidence/screenshots if needed. ` +
                `An Outpost Commander will be with you shortly.`
            )
            .setFooter({ text: 'Press the lock button below to close this ticket.' });

        const closeBtn = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket & Save Log')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒');

        const btnRow = new ActionRowBuilder().addComponents(closeBtn);
        await ticketChannel.send({
            content: `<@${member.id}>`,
            embeds: [ticketEmbed],
            components: [btnRow]
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Failed to deploy ticket channel!',
            ephemeral: true
        });
    }
};
