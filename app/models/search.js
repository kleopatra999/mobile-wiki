import Ember from 'ember';
import fetch from '../utils/mediawiki-fetch';
import {buildUrl, extractEncodedTitle} from '../utils/url';

const {
	A,
	Object: EmberObject,
	computed,
	inject
} = Ember;

export default EmberObject.extend({
	batch: 1,
	error: '',
	erroneousQuery: '',
	items: null,
	loading: false,
	query: '',
	totalItems: 0,
	totalBatches: 0,
	wikiVariables: inject.service(),
	logger: inject.service(),

	canLoadMore: computed('batch', 'totalBatches', function () {
		return this.get('batch') < this.get('totalBatches');
	}),

	init() {
		this._super(...arguments);
		this.set('items', A([]));
	},

	search(query) {
		this.setProperties({
			batch: 1,
			totalItems: 0,
			totalBatches: 0,
			query,
			items: A([])
		});

		if (query) {
			return this.fetch(query);
		}
	},

	loadMore() {
		if (this.get('canLoadMore')) {
			this.set('batch', this.get('batch') + 1);

			return this.fetch(this.get('query'));
		}

		return false;
	},

	fetch(query) {
		this.setProperties({
			error: '',
			loading: true
		});

		return fetch(buildUrl({
			host: this.get('wikiVariables.host'),
			path: '/wikia.php',
			query: {
				controller: 'SearchApi',
				method: 'getList',
				query,
				batch: this.get('batch')
			}
		}))
			.then((response) => {
				if (!response.ok) {
					this.setProperties({
						error: 'search-error-general',
						erroneousQuery: query,
						loading: false
					});

					if (response.status === 404) {
						this.set('error', 'search-error-not-found');
					} else {
						this.get('logger').error('Search request error', response);
					}

					return this;
				} else {
					return response.json().then((data) => {
						// update state on success
						return this.update(data);
					});
				}
			});
	},

	update(state) {
		this.setProperties({
			items: [
				...this.get('items'),
				...state.items.map((item) => {
					return {
						title: item.title,
						snippet: item.snippet,
						prefixedTitle: extractEncodedTitle(item.url)
					};
				})
			],
			loading: false,
			totalItems: state.total,
			totalBatches: state.batches,
		});

		return this;
	}
});
