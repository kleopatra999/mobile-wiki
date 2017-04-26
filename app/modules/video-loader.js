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
	 * @param {string} name
	 * @returns {boolean}
	 */
	isProvider(name) {
		return Boolean(this.data.provider.toLowerCase().match(name));
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
				noAds: this.data.noAds
			});

		this.player = VideoLoader.createPlayer(playerClass, provider, params, this.data.containerId);
		this.player.setupPlayer();
		this.player.onResize();
	}

	/**
	 * @returns {string}
	 */
	getProviderName() {
		if (this.data.provider === 'ooyala-v4') return 'ooyala-v4';
		return this.isProvider('ooyala') ? 'ooyala' : this.data.provider;
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
	 * @returns {BasePlayer|OoyalaPlayer|YouTubePlayer}
	 */
	static createPlayer(playerClass, provider, params, containerId) {
		return new playerClass(provider, params, containerId);
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
