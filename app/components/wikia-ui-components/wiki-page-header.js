/**
 * Wiki Page Header reusable component usage:
 *
 * @example
 * {{wikia-ui-components/wiki-page-header isMainPage=true}}
 *
 * @example
 * {{wikia-ui-components/wiki-page-header title=<title>}}
 *
 * @example
 * {{wikia-ui-components/wiki-page-header
 *   title=<title>
 *   subtitle=<subtitle>
 *   heroImage=<hero image url>}}
 *
 * @example
 * {{#wikia-ui-components/wiki-page-header isMainPage=true}}
 *   {{#link-to '<route>' trackingCategory='<category>' trackingLabel='<label>' bubbles=false}}
 *     {{svg 'pencil' role='img' class='icon pencil'}}
 *   {{/link-to}}
 * {{/wikia-ui-components/wiki-page-header}}
 */

import Ember from 'ember';
import Thumbnailer from '../../modules/thumbnailer';
import ViewportMixin from '../../mixins/viewport';
import {thumbSize} from '../../utils/thumbnail';
import {track, trackActions} from '../../utils/track';

const {
	Component,
	String: {htmlSafe},
	computed,
	inject,
	isEmpty
} = Ember;

export default Component.extend(
	ViewportMixin,
	{
		fastboot: inject.service(),
		wikiVariables: inject.service(),
		imageAspectRatio: 16 / 9,
		classNames: ['wiki-page-header'],
		classNameBindings: ['heroImage:has-hero-image', 'fastboot.isFastBoot:is-fastboot'],
		attributeBindings: ['style'],
		isMainPage: false,
		siteName: computed.reads('wikiVariables.siteName'),
		mainPageTitle: computed.reads('wikiVariables.mainPageTitle'),

		style: computed('heroImage', 'viewportDimensions.width', function () {
			const heroImage = this.get('heroImage'),
				windowWidth = this.get('viewportDimensions.width'),
				imageAspectRatio = this.get('imageAspectRatio');

			let computedHeight,
				cropMode,
				imageHeight,
				imageWidth,
				maxWidth,
				thumbUrl;

			if (isEmpty(heroImage)) {
				return '';
			}

			if (this.get('fastboot.isFastBoot')) {
				// We display brackets placeholder as the background using .is-fastboot class
				return new htmlSafe(`height: ${thumbSize.medium}px`);
			}

			imageWidth = heroImage.width || windowWidth;
			imageHeight = heroImage.height;
			maxWidth = Math.floor(imageHeight * imageAspectRatio);
			computedHeight = imageHeight;
			cropMode = Thumbnailer.mode.thumbnailDown;

			// wide image - crop images wider than 16:9 aspect ratio to 16:9
			if (imageWidth > maxWidth) {
				cropMode = Thumbnailer.mode.zoomCrop;
				computedHeight = Math.floor(windowWidth / imageAspectRatio);
			}

			// image needs resizing
			if (windowWidth < imageWidth) {
				computedHeight = Math.floor(windowWidth * (imageHeight / imageWidth));
			}

			// tall image - use top-crop-down for images taller than square
			if (windowWidth < computedHeight) {
				cropMode = Thumbnailer.mode.topCropDown;
				computedHeight = windowWidth;
			}

			// generate thumbnail
			thumbUrl = Thumbnailer.getThumbURL(heroImage.url, {
				mode: cropMode,
				height: computedHeight,
				width: windowWidth
			});

			return new htmlSafe(`background-image: url(${thumbUrl}); height: ${computedHeight}px`);
		}),

		actions: {
			trackClick() {
				track({
					action: trackActions.click,
					category: 'wikiname',
					label: ''
				});
			}
		}
	}
);
