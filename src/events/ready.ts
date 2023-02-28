import { Client, Events } from "discord.js";
import { logger } from "../index";

export const event = {
	type: Events.ClientReady,
	once: true,
	execute: async (c: Client) => logger.info(`Logged in as ${c.user?.tag}`),
};
