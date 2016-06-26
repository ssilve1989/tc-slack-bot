import Brain from './Brain';
import TCBot from './TCBot';
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

const tcBot = new TCBot(token);
tcBot.Brain = new Brain();
tcBot.initialize();

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

tcBot.Teach = tcBot.Brain.teach.bind(tcBot.Brain);

eachKey(customPhrases, tcBot.Teach);
eachKey(builtinPhrases, tcBot.Teach);
tcBot.Brain.think();
Logger.info('Bot finished learning...time to listen');

tcBot
	.listen()
	.hears([/training time/ig], (bot, message) => {
		Logger.info('Delegating to on-the-fly training module...');
		new Train(tcBot.Brain, bot, message);
	})
	.hears('.*', (bot, message) => {
		const interpretation = tcBot.Brain.interpret(message.text);
		Logger.info(`Bot heard: ${message.text}`);
		Logger.info(`Bot interpretation: ${interpretation}`);

		if(interpretation.guess) {
			tcBot.Brain.invoke(interpretation.guess, interpretation, bot, message);
		}
		else {
			bot.reply(message, 'Hm...I can\'t tell what you said...');
			bot.reply(message, `\`\`\`\n ${JSON.stringify(interpretation)}\n\`\`\``);
		}
	});