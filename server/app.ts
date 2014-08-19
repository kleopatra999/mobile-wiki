/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/hapi/hapi.d.ts" />

import hapi = require('hapi');
import path = require('path');
import localSettings = require('../config/localSettings');

class App {
	constructor() {
		var server: Hapi.Server,
			options: {},
			//Counter for maxRequestPerChild
			counter = 0,
			second = 1000;

		server = hapi.createServer(localSettings.host, localSettings.port, {
			// ez enable cross origin resource sharing
			cors: true,
			cache: this.getCacheSettings(localSettings.cache),
			views: {
				engines: {
					hbs: require('handlebars')
				},
				isCached: true,
				layout: true,
				/*
				 * Helpers are functions usable from within handlebars templates.
				 * @example the getScripts helper can be used like: <script src="{{ getScripts 'foo.js' }}">
				 */
				helpersPath: path.join(__dirname, '../views', '_helpers'),
				path: path.join(__dirname, '../views'),
				partialsPath: path.join(__dirname, '../views', '_partials')
			}
		});

		options = {
			subscribers: {
				console: ['ops', 'request', 'log', 'error']
			}
		};

		server.pack.register({
				plugin: require('good'),
				options: options
			},
			function (err) {
				if (err) {
					console.log('[ERROR] ', err);
				}
			}
		);

		require('./methods')(server);
		/*
		 * Routes
		 */
		require('./routes')(server);

		server.start(function() {
			console.log('Server started at: ' + server.info.uri);
		});

		server.on('response', function () {
			counter++;

			if (counter >= localSettings.maxRequestsPerChild) {
				//This is a safety net for memory leaks
				//It restarts child so even if it leaks we are 'safe'
				process.exit(0);
			}
		});
	}

	/**
	 * @desc Create caching config object based on caching config
	 *
	 * @param {object} cache Cache settings
	 * @returns {object} Caching config
	 */
	private getCacheSettings(cache: CacheInterface): any {
		if (typeof cache === 'object') {
			cache.engine = require('catbox-' + cache.engine);
			return cache;
		}
		// Fallback to memory
		console.log('No cache settings found. Falling back to memory');
		return {
			name: 'appcache',
			engine: require('catbox-memory')
		};
	}
}

var app: App = new App();
