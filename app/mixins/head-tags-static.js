import Ember from 'ember';
import config from '../config/environment';

export default Ember.Mixin.create({
	headData: Ember.inject.service(),

	/**
	 * @returns {void}
	 */
	afterModel(resolvedModel, transition) {
		this._super(...arguments);

		this.setStaticHeadTags(transition.queryParams.noexternals);
	},

	/**
	 * This function sets static head tags defined in templates/head.hbs
	 * This is for head tags which are set only once
	 *
	 * @returns {void}
	 */
	setStaticHeadTags(noexternals) {
		const wikiVariables = this.modelFor('application');

		this.get('headData').setProperties({
			favicon: wikiVariables.favicon,
			themeColor: config.verticalColors[wikiVariables.vertical],
			gaUrl: config.tracking.ua.scriptUrl,
			qualarooScript: config.qualaroo.enabled && config.qualaroo.scriptUrl,
			optimizelyScript: config.optimizely.enabled ?
				`${config.optimizely.scriptPath}${config.optimizely.account}`:
				false,
			isRtl: wikiVariables.language && wikiVariables.language.contentDir === 'rtl',
			noexternals
		});
	}
});
