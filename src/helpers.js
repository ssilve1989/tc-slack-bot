/**
 * Created by ssilvestri on 6/26/16.
 */

export const USER_RE               = /<@(.*)>/;
export const getParticipantsString = (participants) => {
	const message = 'Current members:\n';
	const members = (participants.length === 0) ?
		'0 members.' : participants.map(function(participant) {
		return participant.name;
	}).join('\n');

	return (message + members);
};