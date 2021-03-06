import Ember from 'ember';

const {Helper, inject} = Ember;
/**
 * @param {Array} params
 * @param {Object} options
 * @returns {string}
 */
export default Helper.extend({
	i18n: inject.service(),

	compute(params, options) {
		const i18nParams = {},
			value = params.join('.');

		let namespace = 'main';

		/**
		 * @param {string} key
		 * @returns {void}
		 */
		Object.keys(options).forEach((key) => {
			if (key === 'ns') {
				namespace = options[key];
			} else if (options[key] !== undefined) {
				i18nParams[key] = options[key];
			}
		});

		return this.get('i18n').t(`${namespace}:${value}`, i18nParams);
	}
});
