import Ember from 'ember';

const {Controller, computed} = Ember;

export default Controller.extend({
	additionalData: computed(function () {
		const additionalData = this.get('model.additionalData');

		return additionalData ? JSON.stringify(additionalData, null, 1) : null;
	}),

	stackTrace: computed(function () {
		const stackTrace = (this.get('model.normalizedStack') || '')
			.replace(new RegExp('\\n', 'g'), '<br />');

		return stackTrace ? stackTrace : 'No stack trace available';
	})
});
