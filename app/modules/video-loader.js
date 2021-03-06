import BasePlayer from './video-players/base';
import OoyalaPlayer from './video-players/ooyala';
import OoyalaV4Player from './video-players/ooyala-v4';
import YouTubePlayer from './video-players/youtube';

const playerClassMap = {
	base: BasePlayer,
	ooyala: OoyalaPlayer,
	'ooyala-v4': OoyalaV4Player,
	youtube: YouTubePlayer
};

/**
 * @class VideoLoader
 */
export default class VideoLoader {
	/**
	 * @param {*} data
	 * @returns {void}
	 */
	constructor(data) {
		this.data = data;
	}

	/**
	 * @returns {boolean}
	 */
	isOoyalaV3() {
		// We need to use regexp check because Ooyala provider name may contain 'ooyala/funimation' or
		// other similar
		return Boolean(this.data.provider.toLowerCase().match(/ooyala/)) && this.data.provider !== 'ooyala-v4';
	}

	/**
	 * Loads player for the video, currently either OoyalaPlayer, YouTubePlayer or BasePlayer (default)
	 *
	 * @returns {void}
	 */
	loadPlayerClass() {
		const provider = this.getProviderName(),
			playerClass = VideoLoader.getPlayerClassBasedOnProvider(provider),
			params = $.extend(this.data.jsParams, {
				size: {
					height: this.data.height,
					width: this.data.width
				},
				noAds: this.data.noAds,
			});

		this.player = VideoLoader.createPlayer(playerClass, provider, params);
		this.player.setupPlayer();
		this.player.onResize();
	}

	/**
	 * @returns {string}
	 */
	getProviderName() {
		return this.isOoyalaV3() ? 'ooyala' : this.data.provider;
	}

	/**
	 * @returns {void}
	 */
	onResize() {
		this.player.onResize();
	}

	/**
	 * Creates instance of given class
	 *
	 * @param {string} playerClass
	 * @param {string} provider
	 * @param {Object} params
	 * @returns {BasePlayer|OoyalaPlayer|OoyalaV4Player|YouTubePlayer}
	 */
	static createPlayer(playerClass, provider, params) {
		return new playerClass(provider, params);
	}

	/**
	 * @param {string} provider
	 * @returns {class}
	 */
	static getPlayerClassBasedOnProvider(provider) {
		if (playerClassMap.hasOwnProperty(provider)) {
			return playerClassMap[provider];
		} else {
			return playerClassMap.base;
		}
	}
}
