import Ember from 'ember';

const {Component, computed} = Ember;

export default Component.extend({
	tagName: 'form',
	classNames: ['wds-global-navigation__search'],
	attributeBindings: ['action'],
	searchIsActive: false,

	action: computed.oneWay('model.results.url'),
	searchPlaceholder: computed('searchIsActive', function () {
		if (this.get('searchIsActive')) {
			return i18n.t(
				this.get('model.placeholder-active.key'),
				{
					ns: 'design-system',
					sitename: this.get('model.placeholder-active.params.sitename.value')
				}
			);
		}

		return i18n.t(this.get('model.placeholder-inactive.key'), {ns: 'design-system'});
	}),

	actions: {
		focusSearch() {
			this.set('searchIsActive', true);
			this.sendAction('searchActivate');
		},

		closeSearch() {
			this.set('searchIsActive', false);
			this.sendAction('searchDeactivate');
		}
	}
});
