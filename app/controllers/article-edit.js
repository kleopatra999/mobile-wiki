import Ember from 'ember';
import {track, trackActions} from '../utils/track';
import {normalizeToUnderscore} from '../utils/string';

const {Controller, inject, computed} = Ember;

export default Controller.extend({
	application: inject.controller(),
	i18n: inject.service(),
	wikiVariables: inject.service(),

	isPublishing: false,

	publishDisabled: computed('isPublishing', 'model.isDirty', function () {
		return (this.get('isPublishing') === true || this.get('model.isDirty') === false);
	}),

	// FIXME: Cover more errors
	errorCodeMap: {
		autoblockedtext: 'edit.publish-error-autoblockedtext',
		blocked: 'edit.publish-error-blocked',
		noedit: 'edit.publish-error-noedit',
		'noedit-anon': 'edit.publish-error-noedit-anon',
		protectedpage: 'edit.publish-error-protectedpage'
	},

	/**
	 * @returns {void}
	 */
	handlePublishSuccess() {
		let title = this.get('model.title');

		if (title.indexOf(' ') > -1) {
			title = normalizeToUnderscore(title);
		}

		this.transitionToRoute('wiki-page', title).then(() => {
			this.get('application').addAlert({
				message: this.get('i18n').t('edit.success', {
					pageTitle: title
				}),
				type: 'success'
			});
			this.set('isPublishing', false);
		});

		track({
			action: trackActions.impression,
			category: 'sectioneditor',
			label: 'success'
		});
	},

	/**
	 * @param {*} error
	 * @returns {void}
	 */
	handlePublishError(error) {
		const appController = this.get('application'),
			errorMsg = this.errorCodeMap[error] || 'edit.publish-error';

		appController.addAlert({
			message: this.get('i18n').t(errorMsg),
			type: 'alert'
		});

		appController.set('isLoading', false);

		this.set('isPublishing', false);

		track({
			action: trackActions.impression,
			category: 'sectioneditor',
			label: error || 'edit-publish-error'
		});
	},

	actions: {
		/**
		 * @returns {void}
		 */
		publish() {
			this.set('isPublishing', true);
			this.get('application').set('isLoading', true);

			this.get('model').publish().then(
				this.handlePublishSuccess.bind(this),
				this.handlePublishError.bind(this)
			);

			track({
				action: trackActions.click,
				category: 'sectioneditor',
				label: 'publish'
			});
		},
		/**
		 * @returns {void}
		 */
		back() {
			this.transitionToRoute('wiki-page', this.get('model.title'));
			track({
				action: trackActions.click,
				category: 'sectioneditor',
				label: 'back',
				value: this.get('publishDisabled')
			});
		}
	}
});
