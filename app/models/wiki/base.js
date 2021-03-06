import Ember from 'ember';
import MediaModel from '../media';
import extend from '../../utils/extend';

/**
 * get type for open graph, website is for main page even if API returns 'article'
 *
 * @param {bool} isMainPage
 * @param {string} type
 * @returns string
 */
function getType({isMainPage, details: {type}}) {
	if (isMainPage) {
		return 'website';
	} else {
		return type;
	}
}

const {
	Object: EmberObject,
	get,
	getOwner
} = Ember;

export default EmberObject.extend({
	adsContext: null,
	basePath: null,
	categories: [],
	description: '',
	displayTitle: null,
	htmlTitle: '',
	id: null,
	media: [],
	mediaUsers: [],
	ns: null,
	redirectEmptyTarget: false,
	otherLanguages: [],
	title: null,
	url: null,
	user: null,
	wiki: null,

	/**
	 * @param {Object} data
	 * @returns {void}
	 */
	setData({data}) {
		let pageProperties, article;

		if (data) {
			// This data should always be set
			pageProperties = {
				articleType: get(data, 'articleType'),
				categories: get(data, 'categories'),
				description: get(data, 'details.description'),
				hasArticle: get(data, 'article.content.length') > 0,
				htmlTitle: get(data, 'htmlTitle'),
				id: get(data, 'details.id'),
				ns: get(data, 'ns'),
				title: get(data, 'details.title'),
				url: get(data, 'details.url'),
				type: getType(data),
			};

			// Article related Data - if Article exists
			if (data.article) {
				article = data.article;

				extend(pageProperties, {
					displayTitle: get(data, 'article.displayTitle'),
					user: get(data, 'details.revision.user_id')
				});

				if (article.content && article.content.length > 0) {
					extend(pageProperties, {
						content: article.content,
						mediaUsers: article.users,
						redirectEmptyTarget: data.redirectEmptyTarget,
					});
					pageProperties.media = MediaModel.create(getOwner(this).ownerInjection(), {
						media: article.media
					});
				}
			}

			if (data.otherLanguages) {
				pageProperties.otherLanguages = data.otherLanguages;
			}

			if (data.adsContext) {
				pageProperties.adsContext = data.adsContext;

				if (pageProperties.adsContext.targeting) {
					pageProperties.adsContext.targeting.mercuryPageCategories = pageProperties.categories;
				}
			}

			// Display title is used in header
			pageProperties.displayTitle = pageProperties.displayTitle || pageProperties.title;
		}

		this.setProperties(pageProperties);
	},
});
