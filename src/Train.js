/**
 * Created by ssilvestri on 6/25/16.
 */
import Logger from './Logger';

const fs = require('fs');
const path = require('path');
const customPhrases = require('../custom-phrases');
const CUSTOM_PHRASE_LOCATION = path.join(__dirname, '../custom-phrases.json');

class Train {

	/**
	 *
	 * @param {Brain} Brain
	 * @param speech
	 * @param message
	 */
	constructor(Brain, speech, message) {
		let phraseName;
		let phraseExamples = [];
		const customPhraseKeys = Object.keys(customPhrases);

		Logger.info('Training on the fly!');
		Logger.info('Asking for the name of the skill to be trained...');

		speech.startConversation(message, (err, convo) => {
			convo.ask('Sure! What do you want to call this skill?' +
					'This is the machine name, so pick a good name for a file basename',[

				{
					pattern : ".*",
					callback(response, convo) {
						phraseName = response.text;
						convo.say(`Ok!, I\'ll call it ${phraseName}.`);
						convo.say('Now give me a bunch of ways you might say this.' +
							'When you are done, just send the word done all by itself on one line'
						);
						convo.ask('How might you say this?', [
							{
								pattern : '.*',
								callback(response, convo) {
									phraseExamples.push(response.text);
									reprompt(convo);
									convo.next()
								}
							}
						]);
						convo.next();
					}
				}
			]);
		});

		function reprompt(convo) {
			convo.ask('Ok. How else?', [
				{
					pattern : '^done$',
					callback(response, convo) {
						convo.say('Alright! Let me think on this...');
						Brain.teach(phraseName, phraseExamples);
						Brain.think();
						Train.writeSkill(phraseName, phraseExamples, (err) => {
							if(err) {
								return convo.say('Oh no! Something wen\'t wrong while i was trying to add that to my brain.' +
								`\`\`\`\n${JSON.stringify(err)}\`\`\`\n`);
							}
							convo.say('All done! You should try seeing if I understsand now.')
						});
						convo.next();
					}
				},
				{
					pattern : ".*",
					callback(response, convo) {
						phraseExamples.push(response.text);
						reprompt(convo);
						convo.next();
					}
				}
			]);
		}
	}

	static writeSkill(name, vocab, callback) {
		Logger.info('Preparing to write files for a new empty phraes/skill type...');

		fs.readFile(CUSTOM_PHRASE_LOCATION, (err, data) => {
			if(err) {
				Logger.error('Error loading custom phrase JSON into memory.');
				return callback(err);
			}

			Logger.info('Parsing custom phrase JSON.');

			const customPhrases = JSON.parse(data.toString());
			const existingSkill = getCaseInsensitiveKey(customPhrases, name);

			if(existingSkill) {
				customPhrases[existingSkill] = customPhrases[existingSkill].concat(vocab)
			}
			else {
				customPhrases[name] = vocab;
			}

			Logger.info('About to serialize and write new phrase object...');

			fs.writeFile(CUSTOM_PHRASE_LOCATION, JSON.stringify(customPhrases, null, 2), (err) => {
				if(err) {
					Logger.error('Error writing new serialized phrase object');
					return callback(err);
				}

				Logger.info('Writing updated phrase JSON finished');

				if(!existingSkill) {
					Logger.info('Writing new skill file');
					const emptySkillStream = fs.createReadStream(path.join(__dirname, '/empty.skill.js'));
					const writeStream = fs.createWriteStream(path.join(__dirname, `./skills/${name}.js`));
					emptySkillStream.pipe(writeStream);
					emptySkillStream.on('error', callback);
					writeStream.on('error', callback);
					writeStream.on('finish', callback.bind(null, null));
				}
				else {
					callback();
				}
			});
		});
	}
}

function getCaseInsensitiveKey(obj, query) {
	for(let [key, prop] of Object.entries(obj)) {
		if(key.toLowerCase() === query.toLowerCase()) return key;
	}
}

export default Train;