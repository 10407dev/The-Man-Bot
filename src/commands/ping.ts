import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!").setDMPermission(true),
	execute: async (i: ChatInputCommandInteraction) => await i.reply({ content: `Pong! (${i.client.ws.ping}ms)`, ephemeral: true }),
};
