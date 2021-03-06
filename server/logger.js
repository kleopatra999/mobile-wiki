const BunyanPrettyStream = require('bunyan-prettystream');
const BunyanSyslog = require('bunyan-syslog');
const expressBunyanLogger = require('express-bunyan-logger');
const config = require('../config/fastboot-server');

/**
 * @typedef {Object} BunyanLoggerStream
 * @property {string} level
 * @property {WritableStream} stream
 * @property {string} [type]
 */

/**
 * Creates the default log stream settings
 *
 * @param {string} minLogLevel
 * @returns {BunyanLoggerStream}
 */
function createDefaultLogStream(minLogLevel = 'info') {
	return {
		level: minLogLevel,
		stream: process.stderr
	};
}

/**
 * Creates the console log settings
 *
 * @param {string} minLogLevel
 * @returns {BunyanLoggerStream}
 */
function createConsoleStream(minLogLevel) {
	const prettyStdOut = new BunyanPrettyStream();

	prettyStdOut.pipe(process.stdout);

	return {
		level: minLogLevel,
		stream: prettyStdOut
	};
}

/**
 * Create the SysLog stream settings
 *
 * @param {string} minLogLevel
 * @returns {BunyanLoggerStream}
 */
function createSysLogStream(minLogLevel) {
	return {
		level: minLogLevel,
		type: 'raw',
		stream: BunyanSyslog.createBunyanStream({
			facility: BunyanSyslog.local0,
			type: 'sys'
		})
	};
}

const availableTargets = {
	default: createDefaultLogStream,
	syslog: createSysLogStream,
	console: createConsoleStream
};

const serializers = {
	'req-headers'(req) {
		if (!req) {
			return req;
		}

		const serializedReq = {},
			allowedHeaders = ['accept', 'accept-language', 'fastly-client-ip', 'fastly-orig-accept-encoding',
				'host', 'user-agent', 'x-beacon', 'x-forwarded-for'];

		allowedHeaders.forEach((field) => {
			if (typeof req[field] !== 'undefined') {
				serializedReq[field] = req[field];
			}
		});

		return serializedReq;
	}
};

/**
 * Create logger
 *
 * @param {Object} loggerConfig
 * @returns {Object}
 */
function createLogger(loggerConfig) {
	const streams = [];

	/**
	 * @param {string} loggerType
	 * @returns {void}
	 */
	Object.keys(loggerConfig).forEach((loggerType) => {
		if (!availableTargets.hasOwnProperty(loggerType)) {
			throw new Error(`Unknown logger type ${loggerType}`);
		}

		streams.push(availableTargets[loggerType](loggerConfig[loggerType]));
	});

	if (streams.length === 0) {
		streams.push(createDefaultLogStream());
	}

	return expressBunyanLogger({
		appname: 'mobile-wiki',
		name: 'mobile-wiki',
		excludes: [
			'incoming',
			'ip',
			'remote-address',
			'req',
			'res',
			'response-hrtime',
			'user-agent'
		],
		serializers,
		streams
	});
}

module.exports = createLogger(config.loggers);
