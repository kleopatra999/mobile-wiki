import Ember from 'ember';
import DiscussionParsedContentMixin from '../mixins/discussion-parsed-content';

const {Component, computed} = Ember;

/**
 * Basic methods/properties for discussion-post-card-detail and discussion-post-card-reply.
 */
export default Component.extend(
	DiscussionParsedContentMixin,
	{
		classNameBindings: ['isNew', 'isDeleted', 'isReported', 'isLocked', 'showTopNote'],

		shouldActivateLinks: Ember.computed.alias('isDetailsView'),
		content: Ember.computed.oneWay('post.rawContent'),
		isDeleted: computed.alias('post.isDeleted'),
		isLocked: computed.oneWay('post.isLocked'),
		isNew: computed.oneWay('post.isNew'),
		isReported: computed.alias('post.isReported'),
		showTopNote: computed('isDeleted', 'isReported', 'post.isLocked', function () {
			return !this.get('isDeleted') && this.get('isReported') || this.get('showRepliedTo') ||
				this.get('post.isLocked');
		}),
		shouldTruncateContent: Ember.computed.not('isDetailsView'),
	}
);
