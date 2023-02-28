import { Events, Interaction } from "discord.js";
import { ClientWithCommands, logger } from "../index";

export const event = {
	type: Events.InteractionCreate,
	execute: async (i: Interaction & { client: ClientWithCommands }) => {
		logger.info(i);
		try {
			if (i.isChatInputCommand()) {
				const command = i.client.commands.get(i.commandName);
				if (!command) return i.reply({ content: "Looks like this command doesn't exist anymore. Try again later", ephemeral: true });
				await command.execute(i);
			} else if (i.isMessageComponent()) {
				if (!i.inGuild()) return i.update({});

				const message = (await import(`../messages/${i.channel!.name}`)).default;
				if (!message) return;

				const func = message.functions[i.customId as keyof typeof message.functions];
				if (func) func(i);
			} else if (i.isAutocomplete()) {
				const command = i.client.commands.get(i.commandName);
				if (!command) throw new Error("This command doesn't exist");
				if (!command.autocomplete) throw new Error("This command doesn't have an autocomplete response");

				await command.autocomplete(i);
			}
		} catch (e) {
			logger.error(e);
			const error = { content: `An error occured, try again later:\n\`\`\`${e}\`\`\``, ephemeral: true };
			if (i.isRepliable()) i.replied ? i.followUp(error) : i.reply(error);
		}
	},
};
