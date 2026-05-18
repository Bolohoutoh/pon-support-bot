const {
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const { checkDatabase } = require('../utils/database');

/**
 * Handler modal suggestion_modal — kirim suggestion ke channel target
 * dan re-deploy panel suggestion di channel asal.
 */
module.exports = async function suggestionModal(interaction) {
    const suggestionText = interaction.fields.getTextInputValue('suggestion_text');
    const guildId = interaction.guild.id;
    const settings = checkDatabase(guildId);
    const targetChannelId = settings[guildId]?.suggestionChannelId;
    const targetChannel = targetChannelId
        ? interaction.guild.channels.cache.get(targetChannelId)
        : interaction.channel;

    if (!targetChannel) {
        return interaction.reply({ content: '❌ Target channel error!', ephemeral: true });
    }

    const suggestionEmbed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setAuthor({
            name: `${interaction.user.tag} suggests:`,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(`**Suggestion:**\n${suggestionText}`)
        .setTimestamp()
        .setFooter({ text: 'Vote below! ⬆️ for Yes, ⬇️ for No' });

    try {
        const suggestionMsg = await targetChannel.send({ embeds: [suggestionEmbed] });
        await suggestionMsg.react('⬆️');
        await suggestionMsg.react('⬇️');
        if (interaction.message) await interaction.message.delete().catch(() => {});

        const panelEmbed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('💡 PIONEER IDEAS & SUGGESTIONS')
            .setDescription(
                'Have a thought that could make **Pioneer Outpost Nusa** even greater? ' +
                'Share it with the community!\n\n' +
                '• Click the button below to submit your suggestion.\n' +
                '• The community can vote using ⬆️ and ⬇️ reactions.\n' +
                '• Highly voted ideas will be reviewed and possibly implemented by the Outpost Commanders.\n\n' +
                '*Help us build a better world!*'
            )
            .setImage('https://i.imgur.com/feJtRAt.gif');

        const btn = new ButtonBuilder()
            .setCustomId('create_suggestion')
            .setLabel('CREATE SUGGESTION')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝');

        await interaction.channel.send({
            embeds: [panelEmbed],
            components: [new ActionRowBuilder().addComponents(btn)]
        });
        await interaction.reply({
            content: `✅ Your suggestion has been sent to ${targetChannel}!`,
            ephemeral: true
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Failed to submit suggestion.',
            ephemeral: true
        }).catch(() => {});
    }
};
