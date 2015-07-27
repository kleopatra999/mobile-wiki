/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.CuratedContentEditorSectionEditItemRoute = Em.Route.extend({
	model: function (params: any): typeof App.CuratedContentEditorItemModel {
		var item: string = decodeURIComponent(params.item),
			sectionModel: typeof App.CuratedContentEditorItemModel = this.modelFor('curatedContentEditor.section');

		return App.CuratedContentEditorModel.getSectionItem(sectionModel, item);
	},

	setupController: function (
		controller: any,
		model: typeof App.CuratedContentEditorItemModel,
		transition: EmberStates.Transition
	): void {
		this._super(controller, model, transition);
		controller.set('originalItemLabel', model.label);
	},

	renderTemplate: function (): void {
		this.render('curated-content-editor-item');
	},

	actions: {
		goBack(): void {
			this.transitionTo('curatedContentEditor.section.index');
		},

		updateItem(newItem: typeof App.CuratedContentEditorItemModel): void {
			var sectionModel: typeof App.CuratedContentEditorItemModel = this.modelFor('curatedContentEditor.section'),
				controller: any = this.controllerFor('curatedContentEditor.section.editItem'),
				originalItemLabel: string = controller.get('originalItemLabel');

			App.CuratedContentEditorModel.updateSectionItem(sectionModel, newItem, originalItemLabel);
			this.transitionTo('curatedContentEditor.section.index');
		},

		deleteItem(): void {
			var sectionModel: typeof App.CuratedContentEditorItemModel = this.modelFor('curatedContentEditor.section'),
				controller: any = this.controllerFor('curatedContentEditor.section.editItem'),
				originalItemLabel: string = controller.get('originalItemLabel');

			App.CuratedContentEditorModel.deleteSectionItem(sectionModel, originalItemLabel);
			this.transitionTo('curatedContentEditor.section.index');
		}
	}
});
