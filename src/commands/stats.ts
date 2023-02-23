import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, codeBlock, Status } from "discord.js";

export const command = {
	data: new SlashCommandBuilder().setName("stats").setDescription("Sends bot statistics").setDMPermission(true),
	execute: async (i: ChatInputCommandInteraction) => {
		function formatTime(seconds: number) {
			let time = "";
			const days = Math.floor(seconds / 86400);
			const hours = Math.floor(seconds / 3600) % 24;
			const minutes = Math.floor(seconds / 60) % 60;
			if (days > 0) time += days === 1 ? "1 day " : `${days} days `;
			if (hours > 0) time += hours === 1 ? "1 hour " : `${hours} hours `;
			if (minutes > 0) time += minutes === 1 ? "1 minute" : `${minutes} minutes`;
			else time += seconds === 1 ? "1 second" : `${seconds} seconds`;
			return time;
		}

		const embed = new EmbedBuilder().setColor("#2B2D31").addFields([
			{
				name: "Information",
				value: codeBlock(`Version: ${process.env.npm_package_version ?? "N/A"}\n` + `Node.js: ${process.versions["node"]}\n`),
			},
			{
				name: "Websocket",
				value: codeBlock(
					`Uptime: ${formatTime(Math.floor(i.client.uptime / 1000))}\n` + `Status: ${Status[i.client.ws.status]}\n` + `Ping: ${i.client.ws.ping}ms\n`
				),
			},
		]);

		await i.reply({
			ephemeral: true,
			embeds: [embed],
		});
	},
};
