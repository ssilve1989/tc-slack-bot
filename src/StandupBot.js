/**
 * Created by ssilvestri on 6/24/16.
 */
import Botkit from 'botkit';
import moment from 'moment';

export const Questions = {
	1: "What did you do yesterday?",
	2: "What are you planning to do today?",
	3: "Is there anything blocking you?"
};

class StandupBot {

	constructor(token) {
		this.token      = token;
		this.controller = Botkit.slackbot();
		this.team       = {
			members : [],
			channels: {}
		};
		this.scopes = [
			'direct_mention',
			'direct_message',
			'mention'
		];
	}

	initialize() {
		this.controller.on('hello', (bot) => {
			/*
			bot.api.users.list({}, (err, response) => {
				if(response.ok) {
					response.members.forEach((member) => {
						const { name, id } = member;
						this.team.members.push({ name, id });
					});
					console.log('Loaded members', this.team.members);
				}
			});

			bot.api.channels.list({}, (err, response) => {
				if(response.ok) {
					const { channels } = this.team;
					response.channels.forEach((channel) => {
						channels[ channel.name ] = channel.id;
					});

					if(!channels.status) {
						// create the channel and join it here, needs a different API key
					}
				}
			});
			*/
		});
	}

	listen() {
		this.bot = this.controller.spawn({
			token: this.token
		}).startRTM((err, response) => {
			if(err) throw new Error('Could not connect to slack');
		});
		return this;
	}

	on(event, callback) {
		this.controller.on(event, callback);
	}

	hears(patterns, callback) {
		this.controller.hears(patterns, this.scopes, callback);
		return this;
	}

	aggregateResponses(responses, user) {
		const statusChannel = this.team.channels['status'];
		const member = this.team.members.find((member) => member.id === user);

		const message = `Standup Status for *${member.name} - ${moment().format('MM/DD/YYYY')}*\n
		*${Questions[1]}:* ${responses[Questions[1]]}\n
		*${Questions[2]}:* ${responses[Questions[2]]}\n
		*${Questions[3]}:* ${responses[Questions[3]]}\n`;

		this.bot.say({
			text : message,
			channel : statusChannel
		});
	}
}

export default StandupBot;