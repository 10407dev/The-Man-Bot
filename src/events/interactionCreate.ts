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
		} else if (i.isModalSubmit()) {
			switch (i.customId) {
				case "evalModal":
					const args = i.fields.getTextInputValue("args");
					const code = i.fields.getTextInputValue("code");
					try {
						await i.reply({ content: `Your code returned:\n\`\`\`${Function(args, code)()}\`\`\``, ephemeral: true });
					} catch (e) {
						await i.reply({ content: `Your code failed to execute:\n\`\`\`${e}\`\`\``, ephemeral: true });
					}
					break;
				default:
					await i.reply({ content: "This modal doesn't exist. If you think this is an error, report it and try again later", ephemeral: true });
			}
		}
	},
};
