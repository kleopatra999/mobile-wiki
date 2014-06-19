/// <reference path="../../typings/q/Q.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/follow-redirects/follow-redirects.d.ts" />
/// <reference path="common.ts" />

/**
 * @description Mediawiki API functions
 */

import followRedirects = require('follow-redirects');
import common = require('./common');
import localSettings = require('../../config/localSettings');

module mediawiki {

	interface URLParams {
		[key: string]: string
	}

	function getDomainName(wikiSubDomain: string): string {
		var environment = localSettings.environment,
			options = {
				production: '',
				preview: 'preview.',
				verify: 'verify.',
				sandbox: ''
			};

		if (!environment) {
			throw Error('Environment not set');
		}

		if (typeof localSettings.environment === 'sandbox') {
			return 'http://' + localSettings.host + '.' + wikiSubDomain + '.wikia.com/';
		}

		if (typeof options[environment] !== 'undefined') {
			return 'http://' + options[environment] + wikiSubDomain + '.wikia.com/';
		}
		// Devbox
		return 'http://' + wikiSubDomain + '.' + localSettings.mediawikiHost + '.wikia-dev.com/';
	}

	function createUrl(wikiSubDomain: string, path: string, params: URLParams = {}): string {
		var qsAggregator: string[] = [];
		Object.keys(params).forEach(function(key) {
			qsAggregator.push(key + '=' + encodeURIComponent(params[key]));
		});
		return getDomainName(wikiSubDomain) +
			path +
			(qsAggregator.length > 0 ? '?' + qsAggregator.join('&') : '');
	}

	function httpGet(url: string): Q.Promise<any> {
		return common.promisify(function(deferred: Q.Deferred<any>): void {
			var buffer: string = '';
			followRedirects.http.get(url, function(res) {
				res.on('data', function(chunk: string) {
					buffer += chunk;
				});

				res.on('end', function() {
					deferred.resolve({
						body: buffer,
						headers: res.headers
					});
				});
			})
				.on('error', function(err: Error) {
					deferred.reject(err);
				});
		});
	}

	function jsonGet(url: string): Q.Promise<any> {
		return common.promisify(function(deferred: Q.Deferred<any>): void {
			httpGet(url)
				.then(function(data) {
					try {
						deferred.resolve(JSON.parse(data.body));
					} catch (error) {
						deferred.reject(error);
					}
				})
				.catch(function(error) {
					deferred.reject(error);
				});
		});
	}

	export function article(wikiName: string, articleTitle: string): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Articles/asJson', {
					title: articleTitle
				}
				)
			);
	}

	export function articleDetails(wikiName: string, articleTitles: string[]): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Articles/Details', {
					titles: articleTitles.map(function(text: string): string {
						return text.replace(' ', '_');
					}).join(',')
				}
				)
			);
	}

	export function articleComments(wikiName: string, articleId: number, page: number = 1): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Mercury/ArticleComments', {
					articleId: articleId.toString(),
					page: page.toString()
				}
				)
			);
	}

	export function relatedPages(wikiName: string, articleIds: number[], limit: number = 6): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/RelatedPages/List', {
					ids: articleIds.join(','),
					limit: limit.toString()
				}
				)
			);
	}

	export function userDetails(wikiName: string, userIds: number[]): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/User/Details', {
					ids: userIds.join(',')
				}
				)
			);
	}

	export function getArticleCommentsCount(wikiName: string, articleId: number): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Mercury/ArticleCommentsCount', {
					articleId: articleId.toString()
				}
				)
			);
	}

	export function getWikiTheme(wikiName: string): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Mercury/WikiSettings'
				)
			);
	}

	export function getTopContributors(wikiName: string, articleId: number): Q.Promise<any> {
		return jsonGet(
			createUrl(
				wikiName,
				'api/v1/Mercury/TopContributorsPerArticle', {
					articleId: articleId.toString()
				}
				)
			);
	}
}

export = mediawiki;
