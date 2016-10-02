var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
        	level: 'debug',
        	colorize: true,
        	timestamp: true,
        	filename: './logs/log.log',
        	maxsize: 50000,
        	maxFiles: 100,
        	logstash: true,
        	tailable: true,
        	zippedArchive: true,
        	json: false,
        	stringify: false,
        	prettyPrint: true,
        	depth: 5,
        	humanReadableUnhandledException: true,
        	showLevel: true
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
}; 