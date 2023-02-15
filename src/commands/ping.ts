import { SlashCommandBuilder, CommandInteraction } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!").setDMPermission(true),
	execute: async (i: CommandInteraction) => await i.reply({ content: `Pong! (${i.client.ws.ping}ms)`, ephemeral: true }),
};
