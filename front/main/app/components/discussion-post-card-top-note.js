import Ember from 'ember';
import {checkPermissions} from 'common/utils/discussionPermissions';

export default Ember.Component.extend({
	classNames: ['top-note'],

	canDelete: Ember.computed(function () {
		const post = this.get('post');

		return checkPermissions(post, 'canModerate') && checkPermissions(post, 'canDelete');
	}),

	canModerate: Ember.computed(function () {
		return checkPermissions(this.get('post'), 'canModerate');
	}),

	modalDialogService: Ember.inject.service('modal-dialog'),

	/**
	 * Computes text for the post-card note:
	 *
	 ** "reply reported to moderator"
	 ** "post reported to moderator"
	 ** "a reply to userName, reported to moderator"
	 ** "a reply to userName"
	 */
	text: Ember.computed('isReported', function () {
		if (this.get('isReported')) {
			if (this.get('showRepliedTo')) {

				// post is reported, is a reply and supposed to show reply-to info
				return i18n.t('main.reported-to-moderators-replied-to', {
					ns: 'discussion',
					userName: this.get('threadCreatorName')
				});
			} else if (!this.get('showRepliedTo') && this.get('isReply')) {

				// post is reported, is a reply, but NOT supposed to show reply-to info
				return i18n.t('main.reported-to-moderators-reply', {ns: 'discussion'});
			} else if (!this.get('isReply')) {

				// post is reported and is NOT a reply
				return i18n.t('main.reported-to-moderators', {ns: 'discussion'});
			}
		} else if (this.get('showRepliedTo')) {

			// post is NOT reported, is a reply and supposed to show reply-to info
			return i18n.t('main.user-replied-to', {ns: 'discussion', userName: this.get('threadCreatorName')});
		}
	}),

	actions: {
		/**
		 * Delete item - shows modal dialog first
		 * @param {object} item - post or reply
		 * @param {boolean} isReply - if this is a reply
		 * @returns {void}
		 */
		delete(item, isReply) {
			let message,
				header;

			if (isReply) {
				message = i18n.t(`main.modal-dialog-delete-reply-text`, {ns: 'discussion'});
				header = i18n.t(`main.modal-dialog-delete-reply-header`, {ns: 'discussion'});
			} else {
				message = i18n.t(`main.modal-dialog-delete-text`, {ns: 'discussion'});
				header = i18n.t(`main.modal-dialog-delete-header`, {ns: 'discussion'});
			}

			this.get('modalDialogService').display(
				message,
				header,
				i18n.t('main.modal-dialog-delete', {ns: 'discussion'}),
				(() => this.attrs.delete(item))
			);
		},

		/**
		 * Approve item - shows modal dialog first
		 * @param {object} item - post or reply
		 * @param {boolean} isReply - if this is a reply
		 * @returns {void}
		 */
		approve(item, isReply) {
			let message,
				header;

			if (isReply) {
				message = i18n.t(`main.modal-dialog-approve-reply-text`, {ns: 'discussion'});
				header = i18n.t(`main.modal-dialog-approve-reply-header`, {ns: 'discussion'});
			} else {
				message = i18n.t(`main.modal-dialog-approve-text`, {ns: 'discussion'});
				header = i18n.t(`main.modal-dialog-approve-header`, {ns: 'discussion'});
			}

			this.get('modalDialogService').display(
				message,
				header,
				i18n.t('main.modal-dialog-approve', {ns: 'discussion'}),
				(() => this.attrs.approve(item))
			);
		},
	}
});