export default function(skill, info, bot, message) {
	console.log(`INVOCATON OF NON-CONFIGURED SKILL: ${skill}`);
	bot.reply(message, `I understood this as: ${skill}, but you haven\'t configured how to make me work yet!`);
}