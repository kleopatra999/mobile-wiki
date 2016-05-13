import Ember from 'ember';
import {track as mercuryTrack, trackActions} from 'common/utils/track';

export default Ember.Component.extend(
	{
		classNames: ['wiki-page-header-curated-main-page'],
		mainPageName: Ember.get(Mercury, 'wiki.siteName'),

		actions: {
			trackClick() {
				mercuryTrack({
					action: trackActions.click,
					category: 'wikiname',
					label: ''
				});
			}
		}
	}
);
