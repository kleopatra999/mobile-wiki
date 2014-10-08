/// <reference path="../typings/node/node.d.ts" />
/// <reference path="./localSettings.d.ts" />
/**
 * Base localSettings for application
 * @example
 * var localConfig = require('./config').localSettings
 */

import util = require('util');
import Utils = require('../server/lib/Utils');

var localSettings: LocalSettings = {
	// NOTE: On your devbox, use your eth0 address in able to bind route to something accessible
	host: process.env.HOST,
	port: 8000,
	maxRequestsPerChild: parseInt(process.env.MAX_REQUEST_PER_CHILD, 10) || 1000,
	workerCount: parseInt(process.env.WORKER_COUNT, 10) || 2,
	// Targeted environment [production|preview|verify|devbox|testing]
	environment: Utils.getEnvironment(process.env.WIKIA_ENVIRONMENT),
	mediawikiHost: 'your-devbox-name',
	// Caching settings
	cache: {
		name: 'appcache',
		engine: 'memory' // cache data in [memory|memcached]
		// location: '127.0.0.1:11211' // Check https://github.com/3rd-Eden/node-memcached#server-locations for ref
	},
	proxyMaxRedirects: 3,
	wikiFallback: 'community',
	apiBase: '/api/v1',
	workerDisconnectTimeout: 3000,
	// By default send logs to local syslog only. Possible targets are [syslog, console, default]
	// The value represent the minimum logging level
	loggers: {
		syslog: 'debug'
	},
	tracking: {
		gaId: 'GOOGLE ANALYTICS ID',
		quantserve: 'p-8bG6eLqkH6Avk',
		comscore: {
			keyword: 'comscorekw',
			id: '6177433',
			c7: '',
			c7Value: ''
		}
	}
};

export function getSettings(customLocalSet: any): LocalSettings {
	return util._extend(localSettings, customLocalSet);
}
