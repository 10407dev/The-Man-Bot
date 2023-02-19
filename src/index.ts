import {
	Client,
	Collection,
	ComponentType,
	GatewayIntentBits,
	Interaction,
	MessageComponentInteraction,
	SlashCommandBuilder,
	TextBasedChannel,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Initializing environment variables
dotenv.config();
if (process.env.TOKEN === undefined) throw new Error("Missing TOKEN environment variable");
if (process.env.MAIN_GUILD_ID === undefined) throw new Error("Missing MAIN_GUILD_ID environment variable");
if (process.env.INFO_CHANNEL_ID === undefined) throw new Error("Missing INFO_CHANNEL_ID environment variable");

export class ClientWithCommands extends Client {
	commands: Collection<String, { data: SlashCommandBuilder; execute: (i: Interaction) => void }> = new Collection();
}

const client = new ClientWithCommands({ intents: [GatewayIntentBits.Guilds] });

// Initializing global commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	try {
		client.commands.set(command.data.name, { data: command.data, execute: command.execute });
	} catch {
		console.log(`Skipped incomplete command in ${filePath}`);
	}
}

// Initializing dev commands
const devCommandsPath = path.join(commandsPath, "dev");
const devCommandFiles = fs.readdirSync(devCommandsPath).filter((file) => file.endsWith(".js"));
for (const file of devCommandFiles) {
	const filePath = path.join(devCommandsPath, file);
	const command = require(filePath);
	try {
		client.commands.set(command.data.name, { data: command.data, execute: command.execute });
	} catch {
		console.log(`Skipped incomplete command in ${filePath}`);
	}
}

// Initializing events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.type, (...args) => event.execute(...args));
	} else {
		client.on(event.type, (...args) => event.execute(...args));
	}
}

// Logging in and listening to interactions from info channel
client.login(process.env.TOKEN).then(async () => {
	const { menu, menuActions } = require("./commands/menu");
	const infoChannel = await (await client.guilds.fetch(process.env.MAIN_GUILD_ID!)).channels.fetch(process.env.INFO_CHANNEL_ID!);
	if (infoChannel === null) throw new Error("Info channel was not found.");
	if (infoChannel.isTextBased() === false) throw new Error("Info channel is not text-based.");
	const menuCollector = (infoChannel as TextBasedChannel).createMessageComponentCollector({
		componentType: ComponentType.Button | ComponentType.StringSelect,
	});
	menuCollector.on("collect", async (i: MessageComponentInteraction) => {
		if (menu.messages[i.customId as keyof typeof menu.messages] === undefined) menuActions(i);
		else await i.reply(menu.messages[i.customId as keyof typeof menu.messages]);
	});
});
