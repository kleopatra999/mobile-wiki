import Ember from 'ember';
import {track, trackActions} from '../utils/discussion-tracker';

export default Ember.Component.extend(
	{
		collapsed: true,
		disabled: false,
		visibleCategoriesCount: null,

		init() {
			this._super();
			this.collapseCategoriesAboveLimit(this.get('localCategories'));
		},

		disabledObserver: Ember.observer('disabled', function () {
			if (this.get('disabled') === true) {
				this.send('selectAllCategory', false);
			}
		}),

		isAllCategoriesSelected: Ember.computed('categories.@each.selected', function () {
			return this.get('categories').isEvery('selected', false);
		}),

		localCategories: Ember.computed('categories.@each.selected', function () {
			const categories = this.get('categories'),
				localCategories = new Ember.A();

			categories.forEach((category, index) => {
				localCategories.pushObject(Ember.Object.create({
					category,
					selected: category.selected
				}));
			});

			if (this.get('collapsed')) {
				this.collapseCategoriesAboveLimit(localCategories);
			}

			return localCategories;
		}),

		allCategorySelected: Ember.computed.oneWay('isAllCategoriesSelected'),

		categoriesInputIdPrefix: Ember.computed('inputIdPrefix', function () {
			return `${this.get('inputIdPrefix')}-discussion-category-`;
		}),

		/**
		 * Track click on category
		 * @param {boolean} isAllCategories
		 *
		 * @returns {void}
		 */
		trackCategory(isAllCategories) {
			track(isAllCategories ? trackActions.AllCategoriesTapped : trackActions.CategoryTapped);
		},

		/**
		 * @param {Ember.Array} localCategories
		 *
		 * @returns {void}
		 */
		setAllCategorySelected(localCategories) {
			const isNothingSelected = localCategories.isEvery('selected', false),
				allCategorySelected = this.get('allCategorySelected');

			if (!allCategorySelected && isNothingSelected) {
				this.set('allCategorySelected', true);
			} else if (allCategorySelected && !isNothingSelected) {
				this.set('allCategorySelected', false);
			}
		},

		collapseCategoriesAboveLimit(localCategories) {
			const visibleCategoriesCount = this.get('visibleCategoriesCount');

			if (typeof visibleCategoriesCount === 'number') {
				localCategories.slice(visibleCategoriesCount).setEach('collapsed', true);
			}
		},

		toggleButtonLabel: Ember.computed('localCategories.@each.collapsed', function () {
			if (this.get('localCategories').isEvery('collapsed', false)) {
				return i18n.t('main.categories-show-less-button-label', {ns: 'discussion'});
			} else {
				return i18n.t('main.categories-show-more-button-label', {ns: 'discussion'});
			}
		}),

		toggleButtonVisible: Ember.computed('visibleCategoriesCount', 'localCategories.length', function () {
			return typeof this.get('visibleCategoriesCount') === 'number' &&
				this.get('localCategories.length') > this.get('visibleCategoriesCount');
		}),

		actions: {
			/**
			 * Toggle categories section
			 *
			 * @returns {void}
			 */
			toggle() {
				const collapsed = this.get('collapsed');

				this.set('collapsed', !collapsed);
				track(collapsed ? trackActions.CategoriesUncollaped : trackActions.CategoriesCollaped);
			},

			/**
			 * Show/hide more categories when more than visibleCategoriesCount
			 *
			 * @returns {void}
			 */
			toggleMore() {
				const localCategories = this.get('localCategories');

				if (localCategories.isEvery('collapsed', false)) {
					this.collapseCategoriesAboveLimit(localCategories);
				} else {
					localCategories.setEach('collapsed', false);
				}
			},

			/**
			 * Resets categories module to default state
			 *
			 * @returns {void}
			 */
			reset() {
				const localCategories = this.get('localCategories');

				track(trackActions.CategoriesResetTapped);
				this.set('collapsed', false);
				localCategories.setEach('selected', false);
				this.setAllCategorySelected(localCategories);
				this.collapseCategoriesAboveLimit(localCategories);

				this.sendAction('updateCategories', localCategories);
			},

			/**
			 * @param {boolean} shouldTrack
			 *
			 * @returns {void}
			 */
			selectAllCategory(shouldTrack) {
				const localCategories = this.get('localCategories');

				if (shouldTrack) {
					this.trackCategory(true);
				}

				localCategories.setEach('selected', false);
				this.setAllCategorySelected(localCategories);

				this.sendAction('updateCategories', localCategories);
			},

			/**
			 * @param {Object} localCategory
			 * @param {Event} event
			 *
			 * @returns {void}
			 */
			onCategoryClick(localCategory, event) {
				const localCategories = this.get('localCategories');

				this.trackCategory(false);
				event.preventDefault();

				localCategory.set('selected', !localCategory.get('selected'));

				this.setAllCategorySelected(localCategories);

				this.sendAction('updateCategories', localCategories);
			}
		}
	}
);
