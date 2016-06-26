/**
 * Created by ssilvestri on 6/25/16.
 */
import NLP from 'natural';
import Logger from './Logger';

const toMaxValue = (x, y) => {
	return (x && x.value > y.value) ? x : y;
};

class Brain {

	constructor() {
		this.classifier = new NLP.LogisticRegressionClassifier();
		this.minConfidence = 0.7;
	}

	/**
	 *
	 * @param {string} label
	 * @param {Array} phrases
	 */
	teach(label, phrases) {
		phrases.forEach((phrase) => {
			Logger.info(`Ingesting example for ${label}: ${phrase}`);
			this.classifier.addDocument(phrase.toLowerCase(), label);
		});
	}

	think() {
		this.classifier.train();
	}

	interpret(phrase) {
		const guesses = this.classifier.getClassifications(phrase.toLowerCase());
		const guess = guesses.reduce(toMaxValue);
		return {
			probabilities : guesses,
			guess : guess.value > this.minConfidence ? guess.label : null
		}
	}

	invoke(skill, info, bot, message) {
		let skillCode;
		Logger.debug(`Grabbing code for skill: ${skill}`);

		try {
			skillCode = require('./skills/' + skill);
		} catch(err) {
			console.log(err);
			throw new Error('The invoked skill does not exist!');
		}

		Logger.debug(`Running skill code...`);
		skillCode(skill, info, bot, message);
	}
}

export default Brain;