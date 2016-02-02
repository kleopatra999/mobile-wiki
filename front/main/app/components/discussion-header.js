import Ember from 'ember';
import HeadroomMixin from '../mixins/headroom';

export default Ember.Component.extend(
	HeadroomMixin,
	{
		canDeleteAll: false,

		classNames: ['discussion-header', 'background-theme-color'],

		discussionEditor: Ember.inject.service(),
		discussionSort: Ember.inject.service(),
		isFilterApplied: Ember.computed.not('discussionSort.sortTypes.0.active'),

		filterApplied: Ember.observer('discussionSort.sortTypes.@each.active', function () {
			this.set('isFilterApplied', this.get('discussionSort.sortTypes.0.active') === false);
		}),

		siteName: Ember.computed(() => {
			return Ember.get(Mercury, 'wiki.siteName');
		}),

		actions: {
			toggleEditor(active) {
				this.get('discussionEditor').toggleEditor(active);
			}
		},
	}
);
