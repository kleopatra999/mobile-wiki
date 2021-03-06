/* eslint-env es5, node */
/* eslint prefer-template: 0, prefer-arrow-callback: 0, no-var: 0, object-shorthand: 0, no-empty: 0 */

module.exports = function (environment) {
	var ENV = {
		modulePrefix: 'mobile-wiki',
		environment: environment,
		locationType: 'router-scroll',
		historySupportMiddleware: true,
		facebook: {
			appId: '112328095453510'
		},
		services: {
			domain: 'services.wikia.com',
			discussions: {
				baseAPIPath: 'discussion'
			},
			onSiteNotifications: {
				baseAPIPath: 'on-site-notifications'
			}
		},
		helios: {
			internalUrl: 'http://prod.helios.service.consul:9500/info',
			timeout: 3000
		},
		weppy: {
			enabled: false,
			host: 'http://speed.wikia.net/__rum',
			samplingRate: 0.1,
			aggregationInterval: 1000
		},
		newRelic: {
			agent: 'js-agent.newrelic.com/nr-spa-974.min.js',
			licenseKey: '60e97494a4',
			spaMonitoring: true
		},
		verticalColors: {
			comics: '#ff5400',
			games: '#94d11f',
			books: '#ff7f26',
			movies: '#09d3bf',
			lifestyle: '#ffd000',
			music: '#c819ad',
			tv: '#00b7e0'
		},
		translationsNamespaces: ['main', 'search', 'design-system'],
		tracking: {
			ua: {
				primary: {
					id: 'UA-32129070-1',
					sampleRate: 100
				},
				ads: {
					prefix: 'ads',
					id: 'UA-32129071-1',
					sampleRate: 100
				},
				special: {
					prefix: 'special',
					id: 'UA-32132943-1',
					sampleRate: 100
				},
				scriptUrl: 'https://www.google-analytics.com/analytics.js'
			},
			quantcast: 'p-8bG6eLqkH6Avk',
			comscore: {
				keyword: 'comscorekw',
				id: '6177433',
				c7: '',
				c7Value: ''
			},
			nielsen: {
				apid: 'FIXME',
				dbName: '',
				section: '',
				enabled: false
			},
			krux: {
				mobileId: 'JTKzTN3f'
			},
			netzathleten: {
				enabled: false,
				url: '',
				isMainPage: false
			}
		},
		EmberENV: {
			EXTEND_PROTOTYPES: {
				Array: true,
				String: false,
				Function: false
			},
			FEATURES: {
				// Here you can enable experimental features on an ember canary build
				// e.g. 'with-controller': true
			}
		},
		APP: {
			// Here you can pass flags/options to your application instance
			// when it is created
		},
		fastboot: {
			hostWhitelist: [/.*\.wikia-dev\.(pl|us)/, /.*\.wikia-staging.com/, /.*\.wikia.com/],
			shoeboxAppendTo: 'head'
		},
		ooyala: {
			pcode: 'J0MTUxOtPDJVNZastij14_v7VDRS',
			playerBrandingId: '6d79ed36a62a4a9885d9c961c70289a8'
		}
	};

	if (environment === 'development') {
		ENV.APP.LOG_RESOLVER = false;
		ENV.APP.LOG_ACTIVE_GENERATION = true;
		ENV.APP.LOG_TRANSITIONS = true;
		ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
		ENV.APP.LOG_VIEW_LOOKUPS = true;

		ENV.helios.internalUrl = 'http://dev.helios.service.consul:9500/info';
		ENV.facebook.appId = '881967318489580';

		ENV['ember-cli-mirage'] = {
			enabled: false
		};
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
		ENV.weppy.enabled = true;
	}

	return ENV;
};
