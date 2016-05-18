import {WikiRequest} from '../lib/mediawiki';
import {getCachedWikiDomainName} from '../lib/utils';
import localSettings from '../../config/localSettings';
import showApplication from './show-application';

/**
 * Renders discussions page
 *
 * @param {Hapi.Request} request
 * @param {*} reply
 * @returns {void}
 */
export default function showDiscussions(request, reply) {
	const wikiDomain = getCachedWikiDomainName(localSettings, request),
		wikiVariables = new WikiRequest({wikiDomain}).wikiVariables(),
		context = {};

	if (request.params.type === 'f' && request.params.id) {
		// Make sure old discussion URLs are redirected to discussion main page
		return reply.redirect('/d/f').permanent(true);
	}

	wikiVariables.then((variables) => {
		if (!variables.enableDiscussions) {
			return reply('Not Found').code(404);
		}

		context.documentTitle = `Discussions - ${variables.siteName} - Wikia`;

		showApplication(request, reply, wikiVariables, context);
	});
}
