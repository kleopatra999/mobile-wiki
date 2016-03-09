if (typeof window.M === 'undefined') {
	window.M = {};
}
if (typeof window.M.tracker === 'undefined') {
	window.M.tracker = {};
}
/*eslint no-console: 0*/

/**
 * @typedef {Object} TrackerOptions
 * @property {string} name
 * @property {boolean} allowLinker
 * @property {number} sampleRate
 */

/**
 * @typedef {string|function} UniversalAnalyticsDimension
 */

/**
 * @typedef {UniversalAnalyticsDimension[]} UniversalAnalyticsDimensions
 */

/**
 * @typedef {Object} GAAccount
 * @property {string} id
 * @property {string} [prefix]
 * @property {number} sampleRate
 */

(function (M) {
	let dimensions = [],
		dimensionsSynced = false,
		accounts;

	const createdAccounts = [],
		tracked = [],
		accountPrimary = 'primary',
		accountSpecial = 'special',
		accountAds = 'ads';

	/**
	 * We create new tracker instance every time mercury/utils/track #track or #trackPageView is called
	 * Google wants us to call methods below just once per account
	 *
	 * @param {string} id
	 * @param {string} prefix
	 * @param {Object} options
	 * @returns {void}
	 */
	function setupAccountOnce(id, prefix, options) {
		if (createdAccounts.indexOf(id) === -1) {
			// ga('create', id, 'auto', options);
			// ga(`${prefix}require`, 'linker');

			createdAccounts.push(id);
		}
	}

	/**
	 * Returns proper prefix for given account
	 *
	 * @param {GAAccount} account
	 * @returns {string}
	 */
	function getPrefix(account) {
		return account.prefix ? `${account.prefix}.` : '';
	}

	/**
	 * Initialize an additional account or property
	 *
	 * @param {string} trackerName - The name of the account as specified in localSettings
	 * @param {string} domain
	 * @returns {void}
	 */
	function initAccount(trackerName, domain) {
		const gaUserIdHash = M.prop('gaUserIdHash') || '',
			options = {
				name: '',
				allowLinker: true,
				sampleRate: accounts[trackerName].sampleRate,
				userId: (gaUserIdHash.length > 0 ? gaUserIdHash : null)
			};

		let prefix = '',
			trackerPrefix;

		// Primary account should not have a namespace prefix
		if (trackerName !== accountPrimary) {
			trackerPrefix = accounts[trackerName].prefix;
			prefix = `${trackerPrefix}.`;
			options.name = trackerPrefix;
		}

		setupAccountOnce(accounts[trackerName].id, prefix, options);

		if (domain) {
			// ga(`${prefix}linker:autoLink`, domain);
		}

		console.info('Initialized UA account', trackerName);

		tracked.push(accounts[trackerName]);
	}

	/**
	 * Retrieves string value or invokes function for value
	 *
	 * @param {number} index
	 * @returns {string}
	 */
	function getDimension(index) {
		const dimension = dimensions[index];

		return typeof dimension === 'function' ? dimension() : dimension;
	}

	/**
	 * Syncs dimensions for all trackers - sends dimensions to UA trackers
	 *
	 * This function is being executed before each track and page view events.
	 * It checks if there were any changes to `UniversalAnalytics.dimensions`
	 * and it sends dimensions to all Universal Analytics tracker when necessary.
	 *
	 * That allows us to set dimensions in an initializer and fill the remaining
	 * values later, ie. from the API.
	 *
	 * @returns {void}
	 */
	function syncDimensions() {
		if (!dimensionsSynced) {
			tracked.forEach((account) => {
				const prefix = getPrefix(account);

				dimensions.forEach((dimension, idx) => {
					// ga(`${prefix}set`, `dimension${idx}`, getDimension(idx));
				});
			});

			dimensionsSynced = true;
		}
	}

	/**
	 * Synchronously sets the UA dimensional context
	 *
	 * @param {UniversalAnalyticsDimensions} dimensionsToSet - array of dimensions to set, may be strings or functions
	 * @param {boolean} [overwrite=true] - set to true to overwrite all preexisting dimensions and unset ones not declared
	 * @returns {boolean} true if dimensions were successfully set
	 */
	function setDimensions(dimensionsToSet, overwrite) {
		if (!dimensionsToSet.length) {
			return false;
		}

		if (overwrite === true) {
			dimensions = dimensionsToSet;
		} else {
			$.extend(dimensions, dimensionsToSet);
		}

		dimensionsSynced = false;

		return true;
	}

	/**
	 * @param {number} dimension
	 * @param {UniversalAnalyticsDimension} value
	 * @returns {void}
	 */
	function setDimension(dimension, value) {
		dimensions[dimension] = String(value);
		dimensionsSynced = false;
	}

	/**
	 * Tracks an event, using the parameters native to the UA send() method
	 *
	 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
	 *
	 * @param {string} category - Event category.
	 * @param {string} action - Event action.
	 * @param {string} label - Event label.
	 * @param {number} value - Event value. Has to be an integer.
	 * @param {boolean} nonInteractive - Whether event is non-interactive.
	 * @returns {void}
	 */
	function track(category, action, label, value, nonInteractive) {
		syncDimensions();

		tracked.forEach((account) => {
			// skip over ads tracker (as it's handled in self.trackAds)
			if (account.prefix !== accountAds) {
				const prefix = getPrefix(account);

				// ga(
				// 	`${prefix}send`,
				// 	{
				// 		hitType: 'event',
				// 		eventCategory: category,
				// 		eventAction: action,
				// 		eventLabel: label,
				// 		eventValue: value,
				// 		nonInteraction: nonInteractive
				// 	}
				// );
			}
		});
	}

	/**
	 * Tracks an ads-related event
	 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
	 *
	 * @param {string} category - Event category.
	 * @param {string} action - Event action.
	 * @param {string} label - Event label.
	 * @param {number} value - Event value. Has to be an integer.
	 * @param {boolean} nonInteractive - Whether event is non-interactive.
	 * @returns {void}
	 */
	function trackAds(category, action, label, value, nonInteractive) {
		syncDimensions();

		// ga(
		// 	`${accounts[accountAds].prefix}.send`,
		// 	{
		// 		hitType: 'event',
		// 		eventCategory: category,
		// 		eventAction: action,
		// 		eventLabel: label,
		// 		eventValue: value,
		// 		nonInteraction: nonInteractive
		// 	}
		// );
	}

	/**
	 * Updates current page
	 *
	 * from https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications :
	 * Note: if you send a hit that includes both the location and page fields and the path values are different,
	 * Google Analytics will use the value specified for the page field.
	 *
	 * @param {string} [url=false] - get URL from window location
	 * @returns {void}
	 */
	function updateTrackedUrl(url = false) {
		const location = document.createElement('a');

		location.href = url || window.location.href;

		tracked.forEach((account) => {
			const prefix = getPrefix(account);

			// ga(`${prefix}set`, 'page', location.pathname);
		});
	}

	/**
	 * Tracks the current page view
	 *
	 * @returns {void}
	 */
	function trackPageView() {
		syncDimensions();

		tracked.forEach((account) => {
			const prefix = getPrefix(account);

			// ga(`${prefix}send`, 'pageview');
		});

		console.info('Track PageView: Universal Analytics');
	}

	/**
	 * @param {UniversalAnalyticsDimensions} dimensions
	 * @returns {void}
	 */
	function initialize(dimensions) {
		if (typeof dimensions === 'undefined') {
			console.log(
				'Cannot initialize UA; please provide dimensions'
			);
		} else {
			setDimensions(dimensions);

			// All domains that host content for Wikia
			// Use one of the domains below. If none matches, the tag will fall back to
			// the default which is 'auto', probably good enough in edge cases.
			const domain = [
				'wikia.com', 'ffxiclopedia.org', 'jedipedia.de',
				'marveldatabase.com', 'memory-alpha.org', 'uncyclopedia.org',
				'websitewiki.de', 'wowwiki.com', 'yoyowiki.org'
			].filter((domain) => document.location.hostname.indexOf(domain) > -1)[0];

			accounts = M.prop('tracking.ua');

			initAccount(accountPrimary, domain);
			initAccount(accountAds, domain);

			if (Boolean(M.prop('isGASpecialWiki') || Mercury.wiki.isGASpecialWiki)) {
				initAccount(accountSpecial, domain);
			}

		}
	}


	// API
	M.tracker.UniversalAnalytics = {
		initialize,
		setDimension,
		track,
		trackAds,
		updateTrackedUrl,
		trackPageView
	};
})(M);
