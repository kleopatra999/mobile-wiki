import DiscussionModerationControllerMixin from '../../mixins/discussion-moderation-controller';
import DiscussionContributionControllerMixin from '../../mixins/discussion-contribution-controller';
import DiscussionForumActionsControllerMixin from '../../mixins/discussion-forum-actions-controller';
import ResponsiveMixin from '../../mixins/responsive';
import DiscussionBaseController from './base';

export default DiscussionBaseController.extend(
	DiscussionModerationControllerMixin,
	DiscussionContributionControllerMixin,
	DiscussionForumActionsControllerMixin,
	ResponsiveMixin,
	{
		areGuidelinesVisible: false,
		catId: null,
		postCreatedAtLeastOnce: false,
		shareTooltipSeen: false,
		queryParams: ['sort', 'catId'],

		actions: {
			updateCategoriesSelection(categories) {
				this.get('target').send('updateCategoriesSelection', categories);
			},

			createPost(entityData, forumId) {
				if (this.get('postCreatedAtLeastOnce')) {
					this.set('shareTooltipSeen', true);
				} else {
					this.toggleProperty('postCreatedAtLeastOnce');
				}

				this.transitionToRoute({queryParams: {sort: 'latest'}}).promise.then(() => {
					this.createPost(entityData, forumId);
				});
			}
		}
	}
);
