import Logger from '../Logger';

const myself = `
	I am the standup bot!
	You can talk to me using natural language!
	I can:
		List the participants configured to be in the daily standup
		Add more members to the daily standup list
		Start the meeting
		Tell jokes! (Well...only one joke)
	I can also be trained to understand new things! But only if Steve says its ok.
	Bye!
`;

export default function(skill, info, bot, message) {
	Logger.info('Describing myself...');
	bot.reply(message, myself);
};
