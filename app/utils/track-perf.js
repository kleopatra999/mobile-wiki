/**
 * @typedef {Object} PerfTrackerParams
 * @property {string} type
 * @property {*} [context]
 * @property {string} [module]
 * @property {string} name
 * @property {number} [value]
 * @property {*} [annotations]
 */
import config from '../config/environment';
import Ember from 'ember';

const {get} = Ember;

const context = {
	country: null,
	env: config.wikiaEnv,
	logged_in: false,
	skin: 'mobile_wiki',
	url: window.location && window.location.href.split('#')[0],
	'user-agent': window.navigator && window.navigator.userAgent
};

let tracker;

if (typeof FastBoot === 'undefined') {
	context.country = get(window.M, 'geo.country');
}

/**
 * 1. initialize tracker if it's undefined
 * 2. return tracker or null (if Weppy is not present)
 *
 * @returns {Object|null}
 */
function getTracker() {
	if (typeof tracker === 'undefined') {
		const weppyConfig = config.weppy;

		if (weppyConfig && typeof Weppy === 'function') {
			tracker = Weppy.namespace('mobile_wiki');

			tracker.setOptions({
				aggregationInterval: weppyConfig.aggregationInterval,
				context,
				host: weppyConfig.host,
				sample: weppyConfig.samplingRate,
				transport: 'url'
			});
		} else {
			tracker = null;
		}
	}

	return tracker;
}

/**
 * @param {PerfTrackerParams} params
 * @returns {void}
 */
export function trackPerf(params) {
	let trackFn = getTracker();

	if (!trackFn) {
		return;
	}

	if (typeof params.module === 'string') {
		trackFn = tracker.into(params.module);
	}

	// always set the current URL as part of the context
	context.url = window.location.href.split('#')[0];

	// update context in Weppy with new URL and any explicitly passed overrides for context
	trackFn.setOptions({
		context: $.extend(params.context, context)
	});

	if (typeof params.type === 'undefined') {
		throw new Error('You failed to specify a tracker type.');
	}

	switch (params.type) {
		case 'count':
			trackFn.count(params.name, params.value, params.annotations);
			break;
		case 'store':
			trackFn.store(params.name, params.value, params.annotations);
			break;
		case 'timer':
			trackFn.timer.send(params.name, params.value, params.annotations);
			break;
		case 'mark':
			trackFn.timer.mark(params.name, params.annotations);
			break;
		default:
			throw new Error('This action not supported in Weppy tracker');
	}
}

/**
 * @returns {void}
 */
export function sendPagePerformance() {
	const trackFn = getTracker();

	if (trackFn) {
		trackFn.sendPagePerformance();
	}
}
