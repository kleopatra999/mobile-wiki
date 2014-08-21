/// <reference path="../app.ts" />

'use strict';

interface Transition {
	abort: () => void;
	targetName: string;
}

App.ArticleRoute = Em.Route.extend({
	beforeModel: function (transition: Transition) {
		if (Wikia.error) {
			transition.abort();
		}
	},
	model: function (params: any) {
		return App.ArticleModel.find({
			title: params.articleTitle,
			wiki: this.controllerFor('application').get('domain')
		});
	},
	actions: {
		error: function (error: any, transition: Transition) {
			transition.abort();
			Em.Logger.warn(error);
		},
		// TODO: This currently will scroll to the top even when the app has encountered
		// an error. Optimally, it would remain in the same place.
		willTransition: function (transition: Transition) {
			if (transition.targetName === 'article.index') {
				window.scrollTo(0, 0);
			}
			// notify a property change on soon to be stale model for observers (like
			// the Table of Contents menu) can reset appropriately
			this.notifyPropertyChange('cleanTitle');
		}
	}
});
