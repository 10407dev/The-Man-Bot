import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentEmojiResolvable,
	EmbedBuilder,
	MessageComponentInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

function createButton(label: string, style: ButtonStyle, idOrUrl: string, emoji?: ComponentEmojiResolvable, disabled?: boolean) {
	const button = new ButtonBuilder().setLabel(label).setStyle(style);
	if (style === ButtonStyle.Link) button.setURL(idOrUrl);
	else button.setCustomId(idOrUrl);
	if (emoji !== undefined) button.setEmoji(emoji);
	if (disabled !== undefined) button.setDisabled(disabled);
	return button;
}

export default {
	main: {
		embeds: [new EmbedBuilder().setColor("#2B2D31").setTitle("Competitions of Man")],
		components: [new ActionRowBuilder<ButtonBuilder>().setComponents([createButton("Join", ButtonStyle.Secondary, "join")])],
	},
	functions: {
		join: (i: MessageComponentInteraction) => {
			i.awaitModalSubmit({ filter: (modalInter) => modalInter.customId === "joinModal", time: 1000 * 60 * 10 }).then((modalSubmitInter) => {
				modalSubmitInter.reply({ content: "You have joined Competitions of Man", ephemeral: true });
			});
			i.showModal(
				new ModalBuilder()
					.setTitle("Join Competitions of Man")
					.setCustomId("joinModal")
					.setComponents(
						new ActionRowBuilder<TextInputBuilder>().setComponents(
							new TextInputBuilder().setCustomId("country").setLabel("The country you reside in").setRequired(true).setStyle(TextInputStyle.Short)
						),
						new ActionRowBuilder<TextInputBuilder>().setComponents(
							new TextInputBuilder()
								.setCustomId("region")
								.setLabel("Your region/state/province/etc.")
								.setRequired(true)
								.setStyle(TextInputStyle.Short)
						)
					)
			);
		},
	},
};
