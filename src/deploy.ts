import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Initializing environment variables
dotenv.config();
const TESTING_GUILD_ID = process.env.TESTING_GUILD_ID;
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
if (TOKEN === undefined || CLIENT_ID === undefined) throw new Error("TOKEN or CLIENT_ID was not found in env vars or .env");

// Reading global commands
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

// Reading dev commands
const devCommands = [];
if (TESTING_GUILD_ID !== undefined) {
	const devCommandsPath = path.join(commandsPath, "dev");
	const devCommandFiles = fs.readdirSync(devCommandsPath).filter((file) => file.endsWith(".js"));
	for (const file of devCommandFiles) {
		const filePath = path.join(devCommandsPath, file);
		const command = require(filePath);
		devCommands.push(command.data.toJSON());
	}
}

// Registering all commands
const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
	if (TESTING_GUILD_ID !== undefined) await rest.put(Routes.applicationGuildCommands(CLIENT_ID, TESTING_GUILD_ID), { body: devCommands });
	await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
	console.log(`Successfully updated ${commands.length} global and ${devCommands.length} dev application commands`);
})();
