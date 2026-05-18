const { Events, PermissionFlagsBits } = require('discord.js');
const { SETTINGS_FILE } = require('../config');
const { checkDatabase } = require('../utils/database');
const ticketMenu = require('../interactions/ticketMenu');
const closeTicket = require('../interactions/closeTicket');
const suggestionButton = require('../interactions/suggestionButton');
const suggestionModal = require('../interactions/suggestionModal');
const helpMenu = require('../interactions/helpMenu');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Routing interaksi non-slash
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_menu') return ticketMenu(interaction, client);
            if (interaction.customId === 'help_menu')   return helpMenu(interaction);
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'close_ticket')      return closeTicket(interaction);
            if (interaction.customId === 'create_suggestion') return suggestionButton(interaction);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'suggestion_modal') {
            return suggestionModal(interaction);
        }

        // Slash command dispatch
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const settings    = checkDatabase(interaction.guild.id);
        const isRealAdmin = interaction.member
            ? interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
            : false;
        const isCustomAdmin = settings[interaction.guild.id].authorizedUsers.includes(interaction.user.id);

        try {
            await command.executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin);
        } catch (error) {
            console.error(error);
        }
    }
};
