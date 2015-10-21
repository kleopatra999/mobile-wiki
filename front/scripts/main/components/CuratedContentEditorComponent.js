App.CuratedContentEditorComponent = Em.Component.extend(
	App.AlertNotificationsMixin,
	App.LoadingSpinnerMixin,
	App.TrackClickMixin,
	{
		classNames: ['curated-content-editor'],

		actions: {
			/**
			 * @param {string} block
			 * @returns {void}
			 */
			addBlockItem(block) {
				this.sendAction('addBlockItem', block);
			},

			/**
			 * @returns {void}
			 */
			addSection() {
				this.sendAction('addSection');
			},

			/**
			 * @param {CuratedContentEditorItemModel} item
			 * @param {string} block
			 * @returns {void}
			 */
			editBlockItem(item, block) {
				this.sendAction('editBlockItem', item, block);
			},

			/**
			 * @returns {void}
			 */
			openMainPage() {
				this.sendAction('openMainPage');
			},

			/**
			 * @param {CuratedContentEditorItemModel} section
			 * @returns {void}
			 */
			openSection(section) {
				this.sendAction('openSection', section);
			},

			/**
			 * @returns {void}
			 */
			save() {
				this.trackClick('curated-content-editor', 'save');
				this.validateAndSave();
			}
		},

		/**
		 * @returns {void}
		 */
		validateAndSave() {
			this.showLoader();
			App.CuratedContentEditorModel.save(this.get('model'))
				.then((data) => {
					if (data.status) {
						this.addAlert({
							message: i18n.t('app.curated-content-editor-changes-saved'),
							type: 'info'
						});

						this.sendAction('openMainPage', true);
					} else if (data.error) {
						data.error.forEach(
							(error) => this.processValidationError(error.type, error.reason)
						);
					} else {
						this.addAlert({
							message: i18n.t('app.curated-content-error-other'),
							type: 'alert'
						});
					}
				})
				.catch((err) => {
					if (err.status === 403) {
						this.addAlert({
							message: i18n.t('app.curated-content-editor-error-no-save-permissions'),
							type: 'warning'
						});
					} else {
						Em.Logger.error(err);
						this.addAlert({
							message: i18n.t('app.curated-content-error-other'),
							type: 'alert'
						});
					}
				})
				.finally(() => this.hideLoader());
		},


		/**
		 * @param {String} type
		 * @param {String} reason
		 * @returns {void}
		 */
		processValidationError(type, reason) {
			if (type === 'featured') {
				this.addAlert({
					message: i18n.t('app.curated-content-editor-error-inside-featured-content'),
					type: 'alert'
				});
			} else if (reason === 'itemsMissing') {
				this.addAlert({
					message: i18n.t('app.curated-content-editor-missing-items-error'),
					type: 'alert'
				});
			} else {
				// if other items occur that means user somehow bypassed validation of one or more items earlier
				this.addAlert({
					message: i18n.t('app.curated-content-editor-error-inside-items-message'),
					type: 'alert'
				});
			}
		}
	}
);