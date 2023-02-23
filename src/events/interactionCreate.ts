import { Events, Interaction, InteractionType } from "discord.js";
import { ClientWithCommands } from "../index";
import { messages } from "../commands/messages";

export const event = {
	type: Events.InteractionCreate,
	execute: async (i: Interaction & { client: ClientWithCommands }) => {
		console.table({
			type: InteractionType[i.type],
			guildId: i.inGuild() ? i.guildId : "N/A",
			guildName: i.inGuild() ? i.guild!.name : "N/A",
			user: `${i.user.username}#${i.user.discriminator}`,
		});
		try {
			if (i.isChatInputCommand()) {
				const command = i.client.commands.get(i.commandName);
				if (!command) return await i.reply({ content: "Looks like this command doesn't exist anymore. Try again later", ephemeral: true });
				await command.execute(i);
			} else if (i.isMessageComponent()) {
				if (!i.inGuild()) return i.update({});

				const message = messages.get(i.channel!.name);
				if (!message) return;

				const func = message.functions[i.customId as keyof typeof message.functions];
				if (func) func(i);
			}
		} catch (e) {
			console.error(e);
			const error = { content: `An error occured, try again later:\n\`\`\`${e}\`\`\``, ephemeral: true };
			if (i.isRepliable()) i.replied ? i.followUp(error) : i.reply(error);
		} finally {
			if (i.isRepliable() && !i.replied) i.reply({ content: "Interaction got no response", ephemeral: true });
		}
	},
};
