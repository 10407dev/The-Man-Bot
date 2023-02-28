import { ActivityType, Client, Collection, GatewayIntentBits, ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";

dotenv.config();
const { NODE_ENV, TOKEN } = process.env;
if (!TOKEN) throw new Error("Missing TOKEN");

// Creating a logger
export const logger = createLogger({
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		debug: 3,
	},
	level: "info",
	format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.errors({ stack: true }), format.json()),
	transports: [new transports.File({ filename: "./logs/botAll.log" }), new transports.File({ level: "debug", filename: "./logs/botDebug.log" })],
	exceptionHandlers: [new transports.File({ filename: "./logs/botExceptions.log" })],
});

if (NODE_ENV !== "production") {
	logger.add(
		new transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		})
	);
}

export class ClientWithCommands extends Client {
	commands: Collection<
		String,
		{ data: SlashCommandBuilder; execute: (i: ChatInputCommandInteraction) => any; autocomplete?: (i: AutocompleteInteraction) => any }
	> = new Collection();
}

const client = new ClientWithCommands({
	intents: [GatewayIntentBits.Guilds],
	presence: { activities: [{ type: ActivityType.Watching, name: "the Empire grow" }] },
});

// Initializing global commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath).command;
	try {
		client.commands.set(command.data.name, command);
	} catch {
		throw new Error(`Incomplete command in ${filePath}`);
	}
}

// Initializing events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath).event;
	try {
		if (event.once) client.once(event.type, (...args) => event.execute(...args));
		else client.on(event.type, (...args) => event.execute(...args));
	} catch {
		throw new Error(`Incomplete event in ${filePath}`);
	}
}

client.login(TOKEN);
