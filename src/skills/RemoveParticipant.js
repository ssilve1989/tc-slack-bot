import fs from 'fs';
import path from 'path';
import Logger from '../Logger';
import { USER_RE } from '../helpers';

const participants = require('../../data/participants');

function removeUser(index) {
	const newParticipants = participants.splice(index, 1);
	fs.writeFileSync(path.join(__dirname, '/../../data/participants.json'), JSON.stringify(newParticipants, null, 2));
}

// lets do this one as functions
function start(err, convo) {
	const id = (convo.source_message.text.match(USER_RE) || [])[ 1 ];

	if(id) {
		// retrieve the index, for faster removal
		const index = participants.findIndex((participant) => {
			Logger.info(`Is ${id} === ${participant.id}`);
			return participant.id == id;
		});

		const user = participants[ index ];
		const { bot } = convo.task;

		convo.ask(`Do you really want to remove ${user.name}?`, [
			{
				pattern: bot.utterances.yes,
				callback(response, convo) {
					convo.say('Ok! Removing...');
					removeUser(index);
					convo.say('Removed!');
					convo.next();
				}
			},
			{
				pattern: bot.utterances.no,
				callback(response, convo) {
					convo.say('Got it. I won\'t remove them.')
					convo.next();
				}
			},
			{
				default: true,
				callback(response, convo) {
					convo.say('Sorry I didn\'t quite get that.');
					convo.repeat();
					convo.next();
				}
			}
		]);
	}
	else {
		convo.say('Sorry, I can\'t seem to find that user. Make sure you mentioned them in the message using the \@ symbol');
	}

	convo.next();
}

export default function(skill, info, bot, message) {
	Logger.info('Remove member convo...');

	bot.startConversation(message, start);
}