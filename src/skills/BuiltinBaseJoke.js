module.exports = function(skill, info, bot, message) {
	bot.reply(message, 'What did the bot say to the other bot?');
	bot.reply(message, '```\n01001111 01101110 01101100 01111001 00100000 01101110 01100101 01110010 01100100 01110011 00100000 ' +
		'01101100 01101111 01101111 01101011 00100000 01110101 01110000 00100000 01110111 01101000 01100001 01110100 00100000 ' +
		'01110100 01101000 01101001 01110011 00100000 01110011 01100001 01111001 01110011 00100001\n```');
};