/**
 * Created by ssilvestri on 6/25/16.
 */
import log from 'loglevel';

const NODE_ENV = process.env.NODE_ENV || 'development';

if(NODE_ENV === 'development') {
	log.setLevel(log.levels.DEBUG);
}
else if(NODE_ENV === 'production') {
	log.setLevel(log.levels.WARN);
}

const Logger = log;
export default Logger;
