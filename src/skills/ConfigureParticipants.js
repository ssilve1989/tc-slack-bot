import fs from 'fs';
import path from 'path';
import Logger from '../Logger';

const participants = require('../../data/participants');

const USER_RE               = /<@(.*)>/;
const getParticipantsString = (participants) => {
	const message = 'Current members:\n';
	const members = (participants.length === 0) ?
		'0 members.' : participants.map(function(participant) {
		return participant.name;
	}).join('\n');

	return (message + members);
};

let newParticipants = 0;

class ConfigureParticipants {

	static start(err, convo) {
		const currentMembers = getParticipantsString(participants);

		convo.sayFirst('\`\`\`\n' + currentMembers + '\`\`\`\n');

		convo.ask("Who do you want to add?\n Type \`done\` when finished.", (response, convo) => {
			const { text } = response;

			if(text.toLowerCase().includes('done')) {
				if(newParticipants === 0) {
					convo.say("No new members have been added.");
				}
				else {
					convo.say('Alright! Updating the list...');
					ConfigureParticipants.updateParticipants(response, convo);
				}
			}
			else {
				const match = text.match(USER_RE);
				if(!match) {
					convo.say('You need to @ mention the user you want to add!');
					convo.repeat();
				}
				else {
					ConfigureParticipants.addParticipant(match[ 1 ], convo);
				}
			}
		});
		convo.next();
	}

	static addParticipant(participant, convo) {
		convo.task.bot.api.users.list({}, (err, response) => {
			if(response.ok) {
				const member = response.members.find((member) => {
					return member.id === participant;
				});
				if(member) {
					participants.push(member);
					newParticipants += 1;
					convo.say(`Great! Added: ${member.name}\n
						\`\`\`${getParticipantsString(participants)}\`\`\`\n`);
				}
				else {
					// we are throwing an error because you shouldn't be able to
					// @mention a user that doesn't exist, so we shouldn't have gotten here
					throw new Error(`The mentioned user was unable to be located: ${participant}`);
				}
				convo.repeat();
			}
		});
		convo.next();
	}

	static updateParticipants(response, convo) {
		try {
			fs.writeFileSync(path.join(__dirname, '../../data/participants.json'), JSON.stringify(participants, null, 2), 'utf-8');
			convo.say('Saved!');
		} catch(err) {
			convo.say(`Oh Snap! I an encountered an error\n
				\`\`\`${JSON.stringify(err)}\`\`\`\n`);
		}
		convo.next();
	}
}

export default function(skill, info, bot, message) {
	Logger.info('Configuring members...');

	bot.startConversation(message, ConfigureParticipants.start);
}