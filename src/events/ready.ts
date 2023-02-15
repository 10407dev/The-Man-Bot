import { Client, Events } from "discord.js";

module.exports = {
	type: Events.ClientReady,
	once: true,
	execute: async (c: Client) => console.log(`Logged in as ${c.user?.tag}`),
};
