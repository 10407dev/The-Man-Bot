import { Client, Collection, GatewayIntentBits, Interaction, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Initializing environment variables
dotenv.config();
const TOKEN = process.env.TOKEN;
if (TOKEN === undefined) throw new Error("TOKEN was not found in environment variables or .env");

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
		client.commands.set(command.data.name, command);
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
		client.commands.set(command.data.name, command);
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

client.login(TOKEN);
