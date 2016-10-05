var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
        	level: 'silly',
        	colorize: true,
        	timestamp: true,
        	filename: './logs/logging.log',
        	maxsize: 10000,
        	maxFiles: 100,
        	logstash: true,
        	tailable: true,
        	zippedArchive: true,
        	json: false,
        	stringify: false,
        	prettyPrint: true,
        	depth: 5,
        	humanReadableUnhandledException: true,
        	showLevel: true,
        	stderrLevels: ['error', 'debug']
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            timestamp: true,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;