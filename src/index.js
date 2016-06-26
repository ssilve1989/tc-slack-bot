import Brain from './Brain';
import StandupBot from './StandupBot';
import Train from './Train';
import Logger from './Logger';

const builtinPhrases = require('../builtins');
const fs             = require('fs');
const path           = require('path');
const token          = process.env.SLACK_TOKEN;

if(!token) {
	throw new Error('SLACK_TOKEN could not be found on the environment. Ask your administrator for the token or set it!');
}

const eachKey = (object, callback) => {
	for(let [key, prop] of Object.entries(object)) {
		callback(key, prop);
	}
};

const standupBot = new StandupBot(token);
standupBot.Brain = new Brain();
standupBot.initialize();

let customPhrasesText;
let customPhrases;

try {
	customPhrasesText = fs.readFileSync(path.join(__dirname, '../custom-phrases.json')).toString();
} catch(err) {
	throw new Error('Uh oh. Could not find the custom-phrases.json. Was it moved?');
}

try {
	customPhrases = JSON.parse(customPhrasesText);
} catch(err) {
	throw new Error('Uh oh. custom-phrases.json was not valid JSON. Fix it!');
}

Logger.info('Bot is learning...');

standupBot.Teach = standupBot.Brain.teach.bind(standupBot.Brain);

eachKey(customPhrases, standupBot.Teach);
eachKey(builtinPhrases, standupBot.Teach);
standupBot.Brain.think();
Logger.info('Bot finished learning...time to listen');

standupBot
	.listen()
	.hears([/training time/ig], (speech, message) => {
		Logger.info('Delegating to on-the-fly training module...');
		new Train(standupBot.Brain, speech, message);
	})
	.hears('.*', (speech, message) => {
		const interpretation = standupBot.Brain.interpret(message.text);
		Logger.info(`Bot heard: ${message.text}`);
		Logger.info(`Bot interpretation: ${interpretation}`);

		if(interpretation.guess) {
			standupBot.Brain.invoke(interpretation.guess, interpretation, speech, message);
		}
		else {
			speech.reply(message, 'Hm...I can\'t tell what you said...');
			speech.reply(message, `\`\`\`\n ${JSON.stringify(interpretation)}\n\`\`\``);
		}
	});