import Ember from 'ember';
import MediaModel from '../media';
import {normalizeToWhitespace} from 'common/utils/string';

/**
 * @typedef {Object} ArticleModelUrlParams
 * @property {string} title
 * @property {string} [redirect]
 */

/**
 * @typedef {Object} ArticleModelFindParams
 * @property {string} basePath
 * @property {string} wiki
 * @property {string} title
 * @property {string} [redirect]
 */

const ArticleModel = Ember.Object.extend({
	content: null,
	basePath: null,
	categories: [],
	displayTitle: null,
	comments: 0,
	description: '',
	isMainPage: false,
	mainPageData: null,
	media: [],
	mediaUsers: [],
	otherLanguages: [],
	title: null,
	url: null,
	user: null,
	users: [],
	wiki: null,
	isCuratedMainPage: false
});

ArticleModel.reopenClass({
	/**
	 * @param {ArticleModelUrlParams} params
	 * @returns {string}
	 */
	url(params) {
		let redirect = '';

		if (params.redirect) {
			redirect += `?redirect=${encodeURIComponent(params.redirect)}`;
		}

		return `${M.prop('apiBase')}/article/${params.title}${redirect}`;
	},

	/**
	 * @returns {Ember.RSVP.Promise}
	 */
	getArticleRandomTitle() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: `${M.prop('apiBase')}/article?random&titleOnly`,
				cache: false,
				dataType: 'json',
				success: (data) => {
					if (data.title) {
						resolve(data.title);
					} else {
						reject({
							message: 'Data from server doesn\'t include article title',
							data
						});
					}
				},
				error: (err) => reject(err)
			});
		});
	},

	/**
	 * @returns {*}
	 */
	getPreloadedData() {
		const article = Mercury.article;

		M.prop('articleContentPreloadedInDOM', false);

		if (article.data && article.data.article) {
			// On the first page load the article content is available only in HTML
			article.data.article.content = $('#preloadedContent').html();
		}

		Mercury.article = null;

		return article;
	},

	/**
	 * @param {ArticleModel} model
	 * @param {*} [source=this.getPreloadedData()]
	 * @returns {void}
	 */
	setArticle(model, source = this.getPreloadedData()) {
		const exception = source.exception,
			data = source.data;

		let articleProperties = {},
			details,
			article;

		if (exception) {
			articleProperties = {
				displayTitle: normalizeToWhitespace(model.title),
				exception
			};
		} else if (data) {
			if (data.details) {
				details = data.details;

				articleProperties = {
					ns: details.ns,
					displayTitle: details.title,
					comments: details.comments,
					id: details.id,
					user: details.revision.user_id,
					url: details.url,
					description: details.description
				};
			}

			if (data.article) {
				article = data.article;

				articleProperties = $.extend(articleProperties, {
					content: article.content,
					displayTitle: article.displayTitle,
					mediaUsers: article.users,
					type: article.type,
					media: MediaModel.create({
						media: article.media
					}),
					categories: article.categories,
					redirectEmptyTarget: data.redirectEmptyTarget || false
				});
			}

			if (data.relatedPages) {
				/**
				 * Code to combat a bug observed on the Karen Traviss page on the Star Wars wiki, where there
				 * are no relatedPages for some reason. Moving forward it would be good for the Wikia API
				 * to handle this and never return malformed structures.
				 */
				articleProperties.relatedPages = data.relatedPages;
			}

			if (data.otherLanguages) {
				articleProperties.otherLanguages = data.otherLanguages;
			}

			if (data.adsContext) {
				articleProperties.adsContext = data.adsContext;

				if (articleProperties.adsContext.targeting) {
					articleProperties.adsContext.targeting.mercuryPageCategories = articleProperties.categories;
				}
			}

			if (data.topContributors) {
				// Same issue: the response to the ajax should always be valid and not undefined
				articleProperties.topContributors = data.topContributors;
			}

			articleProperties.isMainPage = data.isMainPage || false;

			if (data.mainPageData) {
				articleProperties.mainPageData = data.mainPageData;
				articleProperties.isCuratedMainPage = true;
			}

			// @todo this will be cleaned up in XW-1053
			articleProperties.articleType = articleProperties.type || data.articleType;
		}

		model.setProperties(articleProperties);
	}
});

export default ArticleModel;