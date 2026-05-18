const { Events, PermissionFlagsBits } = require('discord.js');
const { SETTINGS_FILE } = require('../config');
const { checkDatabase } = require('../utils/database');
const { checkCooldown } = require('../utils/cooldown');
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
        if (!command || !command.executeSlash) return;

        // Cooldown check (3 detik per user per command)
        const remaining = checkCooldown(interaction.user.id, interaction.commandName, 3);
        if (remaining) {
            return interaction.reply({ content: `⏳ Please wait **${remaining}s** before using this command again.`, ephemeral: true });
        }

        const settings    = checkDatabase(interaction.guild.id);
        const isRealAdmin = interaction.member
            ? interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
            : false;
        const isCustomAdmin = settings[interaction.guild.id].authorizedUsers.includes(interaction.user.id);

        try {
            await command.executeSlash(interaction, SETTINGS_FILE, settings, isRealAdmin, isCustomAdmin);
        } catch (error) {
            console.error(`[Slash Error] /${interaction.commandName}:`, error);
            const errorReply = { content: '❌ Something went wrong while executing this command.', ephemeral: true };
            try {
                if (interaction.replied || interaction.deferred) await interaction.followUp(errorReply);
                else await interaction.reply(errorReply);
            } catch (_) {}
        }
    }
};
