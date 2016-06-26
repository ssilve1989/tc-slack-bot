import Logger from '../Logger';

const participants = require('../../data/participants');

export default function(skill, info, bot, message) {
	Logger.info('Configuring participants...');
	let reply = 'Alright! There are currently ' + participants.length + ' participants configured';

	if(participants.length !== 0) {
		const currentParticipants = participants.map((participant) => {
			return participant.name;
		});
		reply += (`\n\`\`\`${currentParticipants.join('\n')}\`\`\``);
	}

	bot.reply(message, reply);
};