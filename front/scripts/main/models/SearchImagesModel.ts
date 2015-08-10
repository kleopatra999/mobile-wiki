/// <reference path="../app.ts" />
/// <reference path="../../baseline/mercury" />
/// <reference path="../mixins/EditMixin.ts" />
/// <reference path="../../baseline/mercury/utils/buildUrl.ts" />
'use strict';

interface SearchPhotoImageResponseInterface {
	title: string;
	type: string;
	url: string;
	width: string;
	height: string;
	thumbnailUrl?: string;
	id: number;
}

interface SearchImageResponseInterface {
	response?: {
		results: {
			photo: {
				batches: number;
				items: SearchPhotoImageResponseInterface[];
			};
		};
		limit: number;
		batch: number;
	};
	error?: any
}

App.SearchImagesModel = Em.Object.extend(App.CuratedContentEditorThumbnailMixin, {
	searchLimit: 24,
	nextBatch: 0,
	batches: 1,
	imageSize: 200,
	searchPhrase: '',
	items: [],

	setItems(fetchedImages: SearchPhotoImageResponseInterface[]) {
		var items = this.get('items');

		this.set('items',
			items.concat(
				fetchedImages.map((image: SearchPhotoImageResponseInterface) => {
					image.thumbnailUrl = this.generateThumbUrl(image.url);

					return image;
				})
			)
		);
	},

	hasNextBatch: Em.computed('batches', 'nextBatch', function() {
		return this.get('batches') > this.get('nextBatch');
	}),

	next(): Em.RSVP.Promise {
		this.incrementProperty('nextBatch');

		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			this.fetch()
				.done((data: SearchImageResponseInterface) => {
					var items: SearchPhotoImageResponseInterface[];

					if (data.error) {
						return reject(data.error)
					}

					items = data.response.results.photo.items;

					this.setItems(items);
					this.set('batches', data.response.results.photo.batches);

					resolve(items);
				})
				.fail((error: any) => {
					reject(error)
				});
		})
	},

	fetch(): JQueryXHR {
		return Em.$.getJSON(
			M.buildUrl({
				path: '/api.php',
			}),
			{
				format: 'json',
				action: 'apimediasearch',
				query: this.get('searchPhrase'),
				type: 'photo',
				batch: this.get('nextBatch'),
				limit: this.searchLimit
			}
		);
	}
});
