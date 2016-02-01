import Ember from 'ember';
import HeadroomMixin from '../mixins/headroom';

export default Ember.Component.extend(
	HeadroomMixin,
	{
		classNames: ['discussion-header', 'background-theme-color'],

		discussionEditor: Ember.inject.service(),
		discussionSort: Ember.inject.service(),
		isFilterApplied: false,

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
