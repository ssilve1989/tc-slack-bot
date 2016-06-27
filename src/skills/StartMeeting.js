import { Questions } from '../TCBot';
import moment from 'moment';
import Logger from '../Logger';

const participants = require('../../data/participants');

class StandupMeeting {
	static start(err, convo) {
		convo.sayFirst("Hey, It's time for the standup.");

		convo.ask(Questions[1], (response, convo) => {
			convo.say('Nice');
			StandupMeeting.todaysStatus(response, convo);
			convo.next();
		});
	}

	static todaysStatus(response, convo) {
		convo.ask(Questions[2], (response, convo) => {
			convo.say('Interesting!');
			StandupMeeting.blockerStatus(response, convo);
			convo.next();
		});
	}

	static blockerStatus(response, convo) {
		convo.ask(Questions[3], (response, convo) => {
			convo.say('Got it!');
			StandupMeeting.extractAndPushResponses(response, convo);
			convo.next();
		});
	}

	static extractAndPushResponses(response, convo) {
		convo.say('Posting your standup status to the standup channel...');
		let member, channel, userId = response.user;
		const bot = convo.task.bot;

		bot.api.users.list({}, (err, response) => {
			if(response.ok) {
				member = response.members.find((member) => {
					return member.id === userId;
				});
				bot.api.channels.list({}, (err, response) => {
					channel = response.channels.find((channel) => {
						return channel.name === 'status'; // TODO: shouldn't be hardcoded
					});
					const responses = convo.extractResponses();
					const status = StandupMeeting.createStatusString(responses, member.name)

					bot.say({
						text : status,
						channel : channel.id
					})
				});
			}
		});
		convo.next();
	}

	static createStatusString(responses, user) {
		// TODO: should probably also handle writing the statuses to storage
		return `Standup Status for *${user} - ${moment().format('MM/DD/YYYY')}*\n
			*${Questions[ 1 ]}:* ${responses[ Questions[ 1 ] ]}\n
			*${Questions[ 2 ]}:* ${responses[ Questions[ 2 ] ]}\n
			*${Questions[ 3 ]}:* ${responses[ Questions[ 3 ] ]}\n`;
	}
}

export default function(skill, info, bot, message) {
	Logger.info('Starting the meeting...');

	if(participants.length === 0) {
		bot.reply(message, "There aren't any participants configured for the standup. Configure some!");
	}
	else {
		participants.forEach((participant) => {
			bot.startPrivateConversation({user : participant.id}, StandupMeeting.start)
		});
	}
}