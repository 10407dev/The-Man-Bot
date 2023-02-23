import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Initializing variables
dotenv.config();
const { TOKEN, CLIENT_ID, TESTING_GUILD_ID, NODE_ENV } = process.env;
if (TOKEN === undefined) throw new Error("Missing TOKEN");
if (CLIENT_ID === undefined) throw new Error("Missing CLIENT_ID");
const rest = new REST({ version: "10" }).setToken(TOKEN);

const commands = [];
if (NODE_ENV === "prod") {
	const commandsPath = path.join(__dirname, "commands");
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath).command;
		commands.push(command.data.toJSON());
	}

	(async () => await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands }))().then(() =>
		console.log(`Successfully updated ${commands.length} global application command${commands.length === 1 ? "" : "s"}`)
	);
}

const devCommands = [];
if (TESTING_GUILD_ID) {
	const devCommandsPath = path.join(__dirname, "commands", "dev");
	const devCommandFiles = fs.readdirSync(devCommandsPath).filter((file) => file.endsWith(".js"));
	for (const file of devCommandFiles) {
		const filePath = path.join(devCommandsPath, file);
		const command = require(filePath).command;
		devCommands.push(command.data.toJSON());
	}

	(async () => await rest.put(Routes.applicationGuildCommands(CLIENT_ID, TESTING_GUILD_ID), { body: devCommands.concat(commands) }))().then(() =>
		console.log(`Successfully updated ${devCommands.length} dev local command${devCommands.length === 1 ? "" : "s"}`)
	);
}
