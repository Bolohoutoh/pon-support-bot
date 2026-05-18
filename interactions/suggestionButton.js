const {
    ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');

/**
 * Handler tombol create_suggestion — menampilkan modal input saran.
 */
module.exports = async function suggestionButton(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('suggestion_modal')
        .setTitle('Submit a Suggestion');

    const suggestionInput = new TextInputBuilder()
        .setCustomId('suggestion_text')
        .setLabel('What is your idea?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

    modal.addComponents(new ActionRowBuilder().addComponents(suggestionInput));
    await interaction.showModal(modal);
};
