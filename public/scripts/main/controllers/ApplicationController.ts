/// <reference path="../app.ts" />
'use strict';

App.ApplicationController = Em.Controller.extend({
	init: function () {
		this._super();
		this.set('domain', Wikia.article.wikiName || window.location.href.match(/^https?:\/\/(.*?)\./)[1]);
		this.set('wikiName', Wikia.article.wikiName || 'Wikia');
		this.set('globalAnimSpeed', 100);
	}
});