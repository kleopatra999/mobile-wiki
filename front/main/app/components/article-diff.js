import Ember from 'ember';

export default Ember.Component.extend({
	classNames: ['diff-page'],
	currentUser: Ember.inject.service(),
	showDiffLink: false,

	actions: {
		/**
		 * @returns {void}
		 */
		undo() {
			this.sendAction('undo');
		}
	}
});
