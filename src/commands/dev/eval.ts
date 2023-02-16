import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Executes given code and returns it's output")
		.setDMPermission(false)
		.setDefaultMemberPermissions(0),
	execute: async (i: ChatInputCommandInteraction) => {
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
		await i.showModal(evalModal);
		const modalSubmitInter = await i.awaitModalSubmit({ filter: (inter) => inter.customId === "evalModal", time: 1000 * 60 * 30 });
		const args = modalSubmitInter.fields.getTextInputValue("args");
		const code = modalSubmitInter.fields.getTextInputValue("code");
		try {
			await modalSubmitInter.reply({ content: `Your code returned:\n\`\`\`${Function(args, code)()}\`\`\``, ephemeral: true });
		} catch (e) {
			await modalSubmitInter.reply({ content: `Your code failed to execute:\n\`\`\`${e}\`\`\``, ephemeral: true });
		}
	},
};
