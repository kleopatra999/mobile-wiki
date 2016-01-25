/* eslint-env es5, node */
/* eslint prefer-template: 0, prefer-arrow-callback: 0, no-var: 0, object-shorthand: 0, no-empty: 0 */

module.exports = function (environment) {
	var ENV = {
		modulePrefix: 'main',
		environment: environment,
		locationType: 'auto',
		EmberENV: {
			FEATURES: {
				// Here you can enable experimental features on an ember canary build
				// e.g. 'with-controller': true
			}
		},
		moment: {
			// locales which we support  | includeLocales: ['de', 'es', 'fr', 'it', 'ja', 'pt-br', 'pl', 'ru', 'zh-cn', 'zh-tw'],
			localeOutputPath: 'assets/vendor/moment/locales'
		},
		APP: {
			// Here you can pass flags/options to your application instance
			// when it is created
		}
	};

	if (environment === 'development') {
		ENV.APP.LOG_RESOLVER = false;
		ENV.APP.LOG_ACTIVE_GENERATION = true;
		ENV.APP.LOG_TRANSITIONS = true;
		ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
		ENV.APP.LOG_VIEW_LOOKUPS = true;
	}

	if (environment === 'test') {
		// Testem prefers this...
		ENV.baseURL = '/';
		ENV.locationType = 'none';

		// keep test console output quieter
		ENV.APP.LOG_ACTIVE_GENERATION = false;
		ENV.APP.LOG_VIEW_LOOKUPS = false;

		ENV.APP.rootElement = '#ember-testing';
	}

	if (environment === 'production') {

	}

	return ENV;
};
