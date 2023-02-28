import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, ChannelType } from "discord.js";
import { logger } from "../index";

export const command = {
	data: new SlashCommandBuilder()
		.setName("messages")
		.setDescription("Manage custom messages in this server")
		.setDMPermission(false)
		.setDefaultMemberPermissions(new PermissionsBitField(["Administrator"]).bitfield)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("send")
				.setDescription("Send a custom message")
				.addStringOption((option) =>
					option
						.addChoices({ name: "information", value: "information" }, { name: "competitions", value: "competitions" })
						.setName("message")
						.setRequired(true)
						.setDescription("Message")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("update")
				.setDescription("Update a custom message")
				.addStringOption((option) =>
					option
						.addChoices({ name: "information", value: "information" }, { name: "competitions", value: "competitions" })
						.setName("message")
						.setRequired(true)
						.setDescription("Message")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("delete")
				.setDescription("Delete a custom message")
				.addStringOption((option) =>
					option
						.addChoices({ name: "information", value: "information" }, { name: "competitions", value: "competitions" })
						.setName("message")
						.setRequired(true)
						.setDescription("Message")
				)
		),
	execute: async (i: ChatInputCommandInteraction) => {
		const choice = i.options.getString("message", true);
		const message = (await import(`../messages/${choice}`)).default;
		if (!message) throw new Error("Chosen message does not exist");

		const channel = (await i.guild!.channels.fetch()).find((c) => c!.name === choice) ?? i.channel;
		if (!channel) throw new Error("Chosen channel does not exist");
		if (!channel.isTextBased()) throw new Error("Chosen channel is not text-based");
		if (channel.type === ChannelType.GuildStageVoice) throw new Error("Stage channels are not supported");

		let originalMessage; // TypeScript be like:
		if (channel.isDMBased()) originalMessage = (await channel.messages.fetch()).find((msg) => msg.author === i.client.user);
		else originalMessage = (await channel.messages.fetch()).find((msg) => msg.author === i.client.user);

		switch (i.options.getSubcommand(true)) {
			case "send":
				channel.send(message.main);
				break;

			case "update":
				if (!originalMessage) throw new Error("Original message could not be found in the specified channel");
				originalMessage.edit(message.main);
				break;

			case "delete":
				if (!originalMessage) throw new Error("Original message could not be found in the specified channel");
				originalMessage.delete();
				break;
		}
	},
};
