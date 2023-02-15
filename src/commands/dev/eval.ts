import { SlashCommandBuilder, CommandInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Executes given code and returns it's output")
		.setDMPermission(false)
		.setDefaultMemberPermissions(0),
	execute: async (i: CommandInteraction) => {
		const evalModal = new ModalBuilder()
			.setTitle("Code Evaluation")
			.setCustomId("evalModal")
			.setComponents([
				new ActionRowBuilder<TextInputBuilder>().setComponents([
					new TextInputBuilder().setCustomId("args").setRequired(false).setStyle(TextInputStyle.Short).setLabel("Arguments to be passed to the code"),
				]),
				new ActionRowBuilder<TextInputBuilder>().setComponents([
					new TextInputBuilder().setCustomId("code").setRequired(true).setStyle(TextInputStyle.Paragraph).setLabel("Code to be executed"),
				]),
			]);
		i.showModal(evalModal);
	},
};
