/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/hapi/hapi.d.ts" />
/// <reference path="../config/localSettings.d.ts" />

// NewRelic is only enabled on one server and that logic is managed by chef, which passes it to our config
if (process.env.NEW_RELIC_ENABLED === 'true') {
	require('newrelic');
}

import Caching       = require('./lib/Caching');
import Hapi          = require('hapi');
import Logger        = require('./lib/Logger');
import Utils         = require('./lib/Utils');
import cluster       = require('cluster');
import localSettings = require('../config/localSettings');
import path          = require('path');
import url           = require('url');

//Counter for maxRequestPerChild
var counter = 1;
var isDevbox: boolean = localSettings.environment === Utils.Environment.Dev;

/**
 * Creates new `hapi` server
 */
var server = new Hapi.Server();

server.connection({
	host: localSettings.host,
	port: localSettings.port,
	routes: {
		state: {
			// We currently don't use any cookies on server side
			// Uncomment this setting if you change the one above as we don't want to fail on invalid cookies
			failAction: 'log'
		}
	}
});

setupLogging(server);

var plugins = [
	{
		register: require('hapi-auth-cookie')
	},
	{
		register: require('crumb'),
		options: {
			cookieOptions: {
				isSecure: false
			}
		}
	},
	{
		register: require('hapi-i18next'),
		options: {
			i18nextOptions: {
				resGetPath: path.join(__dirname, '..', 'front/locales/__lng__/__ns__.json'),
				ns: 'main',
				useCookie: true,
				cookieName: 'lang',
				detectLngFromHeaders: true
			}
		}
	}
];

server.register(plugins, (err: any) => {
	if (err) {
		console.log(err);
		Logger.error(err);
	}
	server.auth.strategy('session', 'cookie', 'required', {
		appendNext     : 'redirect',
		clearInvalid   : true,
		cookie         : 'sid',
		isSecure       : false,
		password       : localSettings.ironSecret,
		redirectTo     : '/login'
	});
});

server.views({
	engines: {
		hbs: require('handlebars')
	},
	isCached: true,
	layout: 'ember-main',
	/*
	 * Helpers are functions usable from within handlebars templates.
	 * @example the getScripts helper can be used like: <script src="{{ getScripts 'foo.js' }}">
	 */
	helpersPath: path.join(__dirname, 'views', '_helpers'),
	layoutPath: path.join(__dirname, 'views', '_layouts'),
	path: path.join(__dirname, 'views'),
	partialsPath: path.join(__dirname, 'views', '_partials'),
	context: {
		i18n: {
			translateWithCache: server.methods.i18n.translateWithCache,
			getInstance: server.methods.i18n.getInstance
		}
	}
});

// instantiate routes
server.route(require('./routes'));

server.ext('onPreResponse', getOnPreResponseHandler(isDevbox));

/**
 * This is the earliest place where we can detect that the request URI was malformed
 * (decodeURIComponent failed in hapijs/call lib and 'badrequest' method was set as a special route handler).
 *
 * When MediaWiki gets request like that it redirects to the main page with code 301.
 *
 * For now we don't want to send additional request to get title of the main page
 * and are redirecting to / which causes user to get the main page eventually.
 */
server.ext('onPreAuth', (request: Hapi.Request, reply: any): any => {
	if (request.route.method === 'badrequest') {
		return reply.redirect('/').permanent(true);
	}
	return reply.continue();
});

server.on('tail', () => {
	counter++;

	if (counter >= localSettings.maxRequestsPerChild) {
		//This is a safety net for memory leaks
		//It restarts child so even if it leaks we are 'safe'
		server.stop({
			timeout: localSettings.backendRequestTimeout
		}, function () {
			Logger.info('Max request per child hit: Server stopped');
			cluster.worker.kill();
		});
	}
});

process.on('message', function (msg: string) {
	if (msg === 'shutdown') {
		server.stop({
			timeout: localSettings.workerDisconnectTimeout
		}, function () {
			Logger.info('Server stopped');
		});
	}
});

server.start(function () {
	Logger.info({url: server.info.uri}, 'Server started');
	process.send('Server started');
});

/**
 * Create new onPreResponseHandler
 *
 * @param isDevbox
 * @returns {function (Hapi.Request, Function): void}
 */
function getOnPreResponseHandler (isDevbox: boolean) {
	return (request: Hapi.Request, reply: any): void => {
		var response = request.response,
			responseTimeSec = ((Date.now() - request.info.received) / 1000).toFixed(3),
			servedBy = localSettings.host || 'mercury';

		// Assets on devbox must not be cached
		// Variety `file` means response was generated by reply.file() e.g. the directory handler
		if (!isDevbox && response.variety === 'file') {
			Caching.setResponseCaching(response, {
				enabled: true,
				cachingPolicy: Caching.Policy.Public,
				varnishTTL: Caching.Interval.long,
				browserTTL: Caching.Interval.long
			});
		}

		if (response && response.header) {
			response.header('x-backend-response-time', responseTimeSec);
			response.header('x-served-by', servedBy);
		} else if (response.isBoom) {
			// see https://github.com/hapijs/boom
			response.output.headers['x-backend-response-time'] = responseTimeSec;
			response.output.headers['x-served-by'] = servedBy;

			// TODO check if this makes sense together with server.on('request-internal')
			Logger.error({
				message: response.message,
				code: response.output.statusCode,
				headers: response.output.headers
			}, 'Response is Boom object');
		}

		reply.continue();
	};
}

/**
 * Setup logging for Hapi events
 *
 * @param server
 */
function setupLogging (server: Hapi.Server): void {
	// Emitted whenever an Internal Server Error (500) error response is sent. Single event per request.
	server.on('request-error', (request: Hapi.Request, err: Error) => {
		Logger.error({
			wiki: request.headers.host,
			text: err.message,
			url: url.format(request.url),
			referrer: request.info.referrer
		}, 'Internal server error');
	});

	// Request events generated internally by the framework (multiple events per request).
	server.on('request-internal', (request: Hapi.Request, event: any, tags: any) => {
		// We exclude implementation tag because it would catch the same error as request-error
		// but without message explaining what exactly happened
		if (tags.error && !tags.implementation) {
			Logger.error({
				wiki: request.headers.host,
				url: url.format(request.url),
				referrer: request.info.referrer,
				eventData: event.data,
				eventTags: tags
			}, 'Internal error');
		}
	});

	// Emitted after a response to a client request is sent back. Single event per request.
	server.on('response', (request: Hapi.Request) => {
		// If there is an error and headers are not present, set the response time to -1 to make these
		// errors easy to discover
		var responseTime = request.response.headers
				&& request.response.headers.hasOwnProperty('x-backend-response-time')
			? parseFloat(request.response.headers['x-backend-response-time'])
			: -1;

		Logger.info({
			wiki: request.headers.host,
			code: request.response.statusCode,
			url: url.format(request.url),
			userAgent: request.headers['user-agent'],
			responseTime: responseTime,
			referrer: request.info.referrer
		}, 'Response');
	});
}
