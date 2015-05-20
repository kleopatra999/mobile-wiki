/// <reference path="../app.ts" />
/// <reference path="../../baseline/mercury.d.ts" />
'use strict';

App.EditController = Em.Controller.extend({
	needs: ['application'],
	init: function() : void {
	},
	actions: {
		publish: function (): void {
			this.get('controllers.application').showLoader();
			App.EditModel.publish(this.model)
				.then((data: any): void => {
					this.transitionToRoute('article', this.model.title).then(() => {
						this.get('controllers.application').addAlert('success', i18n.t('app.edit-success', {pageTitle: this.model.title}));
					})
				});
		}
	},
});
