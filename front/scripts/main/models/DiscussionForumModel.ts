/// <reference path="../app.ts" />

App.DiscussionForumModel = Em.Object.extend({
	wikiId: null,
	forumId: null,
	name: null,
	posts: null,
	totalPosts: 0,

	loadPage (pageNum: number) {
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax(<JQueryAjaxSettings>{
				url: 'https://services.wikia.com/discussion/' + this.wikiId + '/forums/' + this.forumId,
				data: {
					page: pageNum
				},
				dataType: 'json',
				success: (data: any) => {
					var newPosts = data._embedded['doc:threads'],
					    allPosts = this.posts.concat(newPosts);

					this.set('posts', allPosts);

					resolve(this);
				},
				error: (err: any) => reject(err)
			});
		});
	},

	getSortKey (sortBy: string): string {
		switch (sortBy) {
			case 'latest':
				return 'creation_date';
			case 'trending':
				return 'trending';
			default:
				return '';
		}
	}
});

App.DiscussionForumModel.reopenClass({
	find (wikiId: number, forumId: number, sortBy: string) {
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			var forumInstance = App.DiscussionForumModel.create({
				wikiId: wikiId,
				forumId: forumId
			});

			Em.$.ajax(<JQueryAjaxSettings>{
				url: `https://services.wikia.com/discussion/${wikiId}/forums/${forumId}`,
				data: {
					sortKey: forumInstance.getSortKey(sortBy)
				},
				dataType: 'json',
				success: (data: any) => {
					var posts = data._embedded['doc:threads'],
						totalPosts = data.threadCount;

					forumInstance.setProperties({
						name: data.name,
						posts: posts,
						totalPosts: totalPosts
					});

					resolve(forumInstance);
				},
				error: (err) => reject(err)
			});
		});
	},
});
