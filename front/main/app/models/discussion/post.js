import DiscussionBaseModel from '../discussion-base';
import DiscussionModerationModelMixin from '../../mixins/discussion-moderation-model';
import ajaxCall from '../../utils/ajax-call';
import DiscussionEntities from './objects/entities';
import DiscussionPost from './objects/post';
import DiscussionReply from './objects/reply';
import DiscussionContributor from './objects/contributor';

const DiscussionPostModel = DiscussionBaseModel.extend(DiscussionModerationModelMixin, {

	firstPost: null,
	contributors: [],
	isRequesterBlocked: false,
	isReported: false,

	page: 0,
	postCount: 0,
	postId: null,
	pivotId: null,
	replies: [],
	replyLimit: 10,
	upvoteCount: 0,

	/**
	 * @returns {Ember.RSVP.Promise}
	 */
	loadNextPage() {
		return ajaxCall({
			url: M.getDiscussionServiceUrl(`/${this.wikiId}/threads/${this.postId}`, {
				limit: this.replyLimit,
				pivot: this.pivotId,
				page: this.page + 1,
				responseGroup: 'full',
				sortDirection: 'descending',
				sortKey: 'creation_date',
				viewableOnly: false
			}),
			success: (data) => {
				const newReplies = data._embedded['doc:posts'];

				let allReplies;

				newReplies.reverse();
				allReplies = newReplies.map(function (reply) {
					return DiscussionReply.create(reply)
				}).concat(this.get('data.replies'));

				this.get('data').setProperties({
					page: this.get('data.page') + 1,
					replies: newReplies
				});
			},
			error: (err) => {
				this.handleLoadMoreError(err);
			}
		});
	},

	createReply(replyData) {
		this.setFailedState(null);
		replyData.threadId = this.get('postId');

		return ajaxCall({
			data: JSON.stringify(replyData),
			method: 'POST',
			url: M.getDiscussionServiceUrl(`/${this.wikiId}/posts`),
			success: (reply) => {
				reply.isNew = true;
				this.incrementProperty('postCount');
				this.replies.pushObject(reply);
			},
			error: (err) => {
				if (err.status === 401) {
					this.setFailedState('editor.post-error-not-authorized');
				} else {
					this.setFailedState('editor.post-error-general-error');
				}
			}
		});
	},

	setNormalizedData(apiData) {
		const embedded = apiData._embedded,
			normalizedData = DiscussionPost.createFromThreadData(apiData),
			apiRepliesData = embedded['doc:posts'] || [];

		let normalizedRepliesData,
			contributors,
			pivotId;

		normalizedRepliesData = DiscussionEntities.createFromPostsData(apiRepliesData);

		if (normalizedRepliesData.length) {
			pivotId = normalizedRepliesData[0].id;
			normalizedRepliesData.reverse();
		}

		contributors = normalizedRepliesData.map(function (reply) {
			return DiscussionContributor.create(reply.createdBy);
		});

		normalizedData.setProperties({
			contributors: contributors,
			page: 0,
			replies: normalizedRepliesData,
			repliesCount: apiData.postCount
		});

		this.setProperties({
			data: normalizedData,
			pivotId
		});
	}
});

DiscussionPostModel.reopenClass({
	/**
	 * @param {number} wikiId
	 * @param {number} postId
	 * @returns {Ember.RSVP.Promise}
	 */
	find(wikiId, postId) {
		const postInstance = DiscussionPostModel.create({
			wikiId,
			postId
		});

		return ajaxCall({
			context: postInstance,
			url: M.getDiscussionServiceUrl(`/${wikiId}/threads/${postId}`, {
				limit: postInstance.replyLimit,
				responseGroup: 'full',
				sortDirection: 'descending',
				sortKey: 'creation_date',
				viewableOnly: false
			}),
			success: (data) => {
				postInstance.setNormalizedData(data);
			},
			error: (err) => {
				postInstance.setErrorProperty(err);
			}
		});
	}
});

export default DiscussionPostModel;
