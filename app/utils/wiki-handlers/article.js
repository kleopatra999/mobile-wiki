import Ember from 'ember';
import fetch from '../mediawiki-fetch';
import {buildUrl} from '../url';

function addOoyalaAssets(route) {
	if (!route.get('fastboot.isFastBoot')) {
		return;
	}

	// Render components into FastBoot's HTML, outside of the Ember app so they're not touched when Ember starts
	const applicationInstance = Ember.getOwner(route);
	const document = applicationInstance.lookup('service:-document');
	const articleVideoScripts = applicationInstance.lookup('component:fastboot-only/article-video-scripts');
	const articleVideoStyles = applicationInstance.lookup('component:fastboot-only/article-video-styles');
	articleVideoScripts.appendTo(document.body);
	articleVideoStyles.appendTo(document.head);
}

/**
 * @param {Ember.Route} route
 * @param {Ember.model} model
 * @returns {void}
 */
function afterModel(route, model) {
	// Reset query parameters
	model.set('commentsPage', null);

	route.set('redirectEmptyTarget', model.get('redirectEmptyTarget'));

	// Include Ooyala assets if there is no portable infobox and featured video is attached
	if (!model.get('hasPortableInfobox') && model.get('featuredVideo')) {
		addOoyalaAssets(route);
	}
}

/**
 * This function tracks page view only on articles on Lyrics Wiki (id: 43339).
 * Notice that params amgid and gracenoteid are set to 0, those params are not important,
 * but to be consistent with Oasis we send them
 *
 * https://github.com/Wikia/app/blob/dev/extensions/3rdparty/LyricWiki/LyricFind/js/modules/LyricFind.Tracker.js
 *
 * @param {Ember.model} model
 * @param {number} wikiId
 * @param {String} host
 */
function sendLyricsPageView(model, wikiId, host) {
	if (wikiId === 43339 && !model.get('isMainPage')) {
		fetch(buildUrl({
			host,
			path: '/wikia.php',
			query: {
				controller: 'LyricFind',
				method: 'track',
				title: model.get('title'),
				amgid: 0,
				gracenoteid: 0,
				rand: (`${Math.random()}`).substr(2, 8)
			}
		}));
	}
}

/**
 * Hook triggered on transition.then() in Route::afterModel()
 *
 * @param {Ember.model} model
 * @param {number} wikiId
 * @param {String} host
 */
function afterTransition(model, wikiId, host) {
	sendLyricsPageView(model, wikiId, host);
}

/**
 * Export Article handler
 */
export default {
	// template's and controller's name
	controllerName: 'article',
	viewName: 'article',
	afterModel,
	afterTransition
};
