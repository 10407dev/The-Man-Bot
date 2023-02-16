import { Events, Interaction } from "discord.js";
import { ClientWithCommands } from "../index";

module.exports = {
	type: Events.InteractionCreate,
	execute: async (i: Interaction & { client: ClientWithCommands }) => {
		if (i.isChatInputCommand()) {
			const command = i.client.commands.get(i.commandName);
			if (!command) {
				await i.reply({ content: "This is not a command anymore. If you think this is a mistake, report it and try again later", ephemeral: true });
			} else {
				try {
					command.execute(i);
				} catch (e) {
					console.error(e);
					await i.reply({ content: `An error occured. Report it and try again later.\n\`\`\`${e as string}\`\`\``, ephemeral: true });
				}
			}
		}
	},
};
