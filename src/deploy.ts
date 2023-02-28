import { REST, Routes } from "discord.js";
import { logger } from "./index";
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
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath).command;
	commands.push(command.data.toJSON());
}

(async () => {
	if (NODE_ENV === "production") rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
	else if (TESTING_GUILD_ID) rest.put(Routes.applicationGuildCommands(CLIENT_ID, TESTING_GUILD_ID), { body: commands });
})().then(() => logger.info(`Updated ${commands.length} command${commands.length === 1 ? "" : "s"} ${NODE_ENV === "production" ? "globally" : "locally"}`));
