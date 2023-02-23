import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentEmojiResolvable,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	MessageComponentInteraction,
	Collection,
	StageChannel,
	ChannelType,
} from "discord.js";
import mongoose from "mongoose";
import { mongoURI } from "../database";
import UserModel from "../schemas/User";

export const command = {
	data: new SlashCommandBuilder()
		.setName("messages")
		.setDescription("Manage custom messages in this server")
		.setDMPermission(false)
		.setDefaultMemberPermissions(new PermissionsBitField(["ManageGuild"]).bitfield)
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

		const channel = (await i.guild!.channels.fetch()).find((c) => c!.name === choice);
		if (!channel) throw new Error("Chosen channel does not exist");
		if (!channel.isTextBased()) throw new Error("Chosen channel is not text-based");
		if (channel.type === ChannelType.GuildStageVoice) throw new Error("Stage channels are currently unsupported")

		const message = messages.get(choice);
		if (!message) throw new Error("Chosen message does not exist");

		const originalMessage = (await channel.messages.fetch()).find((msg) => msg.author === i.client.user);

		switch (i.options.getSubcommand(false)) {
			case "send":
				await channel.send(message.main);
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

function createButton(label: string, style: ButtonStyle, idOrUrl: string, emoji?: ComponentEmojiResolvable, disabled?: boolean) {
	const button = new ButtonBuilder().setLabel(label).setStyle(style);
	if (style === ButtonStyle.Link) button.setURL(idOrUrl);
	else button.setCustomId(idOrUrl);
	if (emoji !== undefined) button.setEmoji(emoji);
	if (disabled !== undefined) button.setDisabled(disabled);
	return button;
}

async function changeRoles(i: MessageComponentInteraction) {
	if (!i.isStringSelectMenu()) return;
	let message = { content: "Changed roles:\n", ephemeral: true };
	const member = await i.guild!.members.fetch(i.user);
	i.values.forEach((role) => {
		if (member.roles.cache.has(role)) {
			member.roles.remove(role);
			message.content += `**-** <@&${role}>\n`;
		} else {
			member.roles.add(role);
			message.content += `**+** <@&${role}>\n`;
		}
	});
	return i.reply(message);
}

export const messages = new Collection([
	[
		"information",
		{
			main: {
				embeds: [
					new EmbedBuilder()
						.setImage("https://cdn.discordapp.com/attachments/1070617876601520178/1074560345919725608/EMPIRE_OF_MAN_Banner.png")
						.setColor("#2B2D31"),
					new EmbedBuilder()
						.setImage("https://cdn.discordapp.com/attachments/1070617876601520178/1074559129965842492/Fictional_Men_Banner.png")
						.setColor("#2B2D31")
						.setTitle("Welcome to the Empire of Man")
						.setDescription("**The international self-improvement community that unites boys, to turn them into men!**\n")
						.setFields([
							{
								name: "\n",
								value: ">>> We are committed to bringing together men on self improvement from across the world to **help you find your national self improvement community!**\n\nWe offer several fantastic opportunities for you to share ideas, provide feedback to community leaders, take part in international self improvement events, and **create a meaningful life for yourself and others!**\n",
							},
							{
								name: "Use the buttons below this message to...",
								value: "<:arrow_color3:1076505147087257600> Read the rules of this server\n<:arrow_color3:1076505147087257600> Learn more about the Empire of Man\n<:arrow_color3:1076505147087257600> Customise your profile with roles\n<:arrow_color3:1076505147087257600> Join your national self-improvement community",
							},
						]),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().setComponents([
						createButton("Rules", ButtonStyle.Secondary, "rules", "<:rules:1076505939571638313>"),
						createButton("Learn", ButtonStyle.Secondary, "learn", "<:learn:1076505932084805742>"),
						createButton("Roles", ButtonStyle.Secondary, "roles", "<:roles:1076505935138279544>"),
						createButton("Join your Tribe", ButtonStyle.Link, "https://empire-of-man.netlify.app/", "<:tribe:1076505944172793947>"),
						createButton(
							"Support",
							ButtonStyle.Link,
							"https://discord.com/channels/1068145293306106006/1070886025515253790",
							"<:support:1076505941631045713>"
						),
					]),
				],
			},
			functions: {
				rules: (i: MessageComponentInteraction) =>
					i.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder()
								.setColor("#2B2D31")
								.setTitle("<:rules:1076505939571638313> Server Rules")
								.setFields([
									{
										name: "Be respectful",
										value: "Nobody here wants to see spam, NSFW, advertising, or political chat. Please help us keep those topics out of our community and dms.",
										inline: true,
									},
									{
										name: "Be mature",
										value: "When a debate turns into an argument, consider stepping away from the chat. The team may get involved, we ask that you please listen to us as we are here to help.",
										inline: true,
									},
									{
										name: "Be mindful",
										value: "Please help us to keep chat in the best channels as well as high quality to be engaging and meaningful. We are a volunteer, community-run, Discord.",
										inline: true,
									},
								]),
						],
						components: [
							new ActionRowBuilder<ButtonBuilder>().setComponents([
								createButton("Discord Terms of Service", ButtonStyle.Link, "https://discord.com/terms"),
								createButton("Discord Community Guidelines", ButtonStyle.Link, "https://discord.com/guidelines"),
							]),
						],
					}),
				learn: (i: MessageComponentInteraction) =>
					i.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder()
								.setColor("#2B2D31")
								.setTitle("<:info:1076514386014904453> The Empire of Man")
								.setDescription(
									"The Empire of Man is an **internationally recognised self-improvement community and movement**. You can find a Discord server for your national community, where you can meet up with other men from your country who are also actively improving themselves.\n\nThe Empire of Man server acts as the central hub for the brand and all the communities associated with it. In this server, members can speak to people from all around the world, while your national server is just for people from your country. This server is also where the staff from across the entire network **meet to discuss changes, plan projects and help improve** the Empire of Man network as a whole.\n\n**__Our mission is to create the best self-improvement community and resource in the world__**. Any changes or ideas that align with this mission, are going to be welcomed and seriously worked on."
								)
								.setFields([
									{
										name: "Some of the things we do...",
										value: "• Host international self-improvement competitions\n• Develop products that help you with your self-improvement\n• Create content to educate and inspire those that need it",
										inline: true,
									},
									{
										name: "Network Profile",
										value: "• Founded on <t:1675421640:D>\n• Founder: <@778510437498093589>\n• Main Bot: <@1074683261286101043>",
										inline: true,
									},
								]),
						],
					}),

				roles: (i: MessageComponentInteraction) =>
					i.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder()
								.setColor("#2B2D31")
								.setTitle("<:roles:1076505935138279544> Customise your Profile")
								.setDescription("Choose the roles that best reflect your location, age, and your preferences for community notifications")
								.setFields([
									{
										name: "Continent",
										value: "<@&1070872830687838279>\n<@&1070873047688544357>\n<@&1070872880977547314>\n<@&1070872971620646952>\n<@&1070873286025687060>",
										inline: true,
									},
									{ name: "Age", value: "<@&1070873433212207134>\n<@&1070873523498778745>\n<@&1070873588460179476>", inline: true },
									{
										name: "Notifications",
										value: "<@&1070873741321576540> Get notified on server changes and updates.\n<@&1070873834305093673> Never miss out on any international events!\n<@&1070873858946646066> Get notified of new posts in the <#1070584509801693194> channel!",
										inline: true,
									},
								]),
						],
						components: [
							new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
								new StringSelectMenuBuilder()
									.setPlaceholder("Which continent do you reside in?")
									.setCustomId("continentRole")
									.setOptions([
										new StringSelectMenuOptionBuilder().setLabel("Africa").setEmoji({ name: "🌍" }).setValue("1070872830687838279"),
										new StringSelectMenuOptionBuilder().setLabel("Americas").setEmoji({ name: "🌎" }).setValue("1070873047688544357"),
										new StringSelectMenuOptionBuilder().setLabel("Asia").setEmoji({ name: "🌏" }).setValue("1070872880977547314"),
										new StringSelectMenuOptionBuilder().setLabel("Europe").setEmoji({ name: "🌍" }).setValue("1070872971620646952"),
										new StringSelectMenuOptionBuilder().setLabel("Oceania").setEmoji({ name: "🌏" }).setValue("1070873286025687060"),
									])
							),
							new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
								new StringSelectMenuBuilder()
									.setPlaceholder("What is your age range?")
									.setCustomId("ageRole")
									.setOptions([
										new StringSelectMenuOptionBuilder().setLabel("Under 15").setValue("1070873433212207134"),
										new StringSelectMenuOptionBuilder().setLabel("15 - 17").setValue("1070873523498778745"),
										new StringSelectMenuOptionBuilder().setLabel("18 +").setValue("1070873588460179476"),
									])
							),
							new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
								new StringSelectMenuBuilder()
									.setPlaceholder("What do you want to be notified about?")
									.setCustomId("notificationsRole")
									.setMinValues(1)
									.setMaxValues(3)
									.setOptions([
										new StringSelectMenuOptionBuilder().setLabel("News").setEmoji({ name: "🗞️" }).setValue("1070873741321576540"),
										new StringSelectMenuOptionBuilder().setLabel("Events").setEmoji({ name: "📯" }).setValue("1070873834305093673"),
										new StringSelectMenuOptionBuilder().setLabel("Feed").setEmoji({ name: "🎉" }).setValue("1070873858946646066"),
									])
							),
						],
					}),
				continentRole: (i: MessageComponentInteraction) => changeRoles(i),
				ageRole: (i: MessageComponentInteraction) => changeRoles(i),
				notificationsRole: (i: MessageComponentInteraction) => changeRoles(i),
			},
		},
	],
	[
		"competitions",
		{
			main: {
				embeds: [new EmbedBuilder().setColor("#2B2D31").setTitle("Competitions of Man")],
				components: [new ActionRowBuilder<ButtonBuilder>().setComponents([createButton("Join", ButtonStyle.Secondary, "join")])],
			},
			functions: {
				join: (i: MessageComponentInteraction) => {
					mongoose
						.connect(mongoURI)
						.then(async () =>
							new UserModel({
								id: i.user.id,
								username: i.user.username,
								currency: { gold: 0, silver: 0 },
								country: "Russia",
								state: "Krasnodar Territory",
							}).save()
						)
						.catch((err) => console.error(err));
				},
			},
		},
	],
]);
