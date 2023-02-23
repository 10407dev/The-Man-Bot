import { Client, Events } from "discord.js";

export const event = {
	type: Events.ClientReady,
	once: true,
	execute: async (c: Client) => console.log(`Logged in as ${c.user?.tag}`),
};
