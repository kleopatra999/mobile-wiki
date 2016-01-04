/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
	var app = new EmberApp(defaults, {
		inlineContent: {
			baseline: 'vendor/baseline.js',
			'wikia-logo': '../common/public/symbols/wikia-logo-blue.svg'
		},
		sassOptions: {
			includePaths: [
				'app/styles'
			]
		},
		svgstore: {
			files: [
				{
					sourceDirs: 'app/symbols/main',
					outputFile: '/assets/main.svg'
				},
				{
					sourceDirs: 'app/symbols/discussions',
					outputFile: '/assets/discussions.svg'
				},
				// This duplicates build-common-symbols task but we still want to do it
				// as there is no easy way to use external rev-manifest.json in here
				{
					sourceDirs: '../common/symbols',
					outputFile: '/assets/common.svg'
				}
			]
		},
		outputPaths: {
			app: {
				css: {
					'main/app': 'assets/main.css',
					'main/app-dark-theme': 'assets/app-dark-theme.css',
					'discussions/app': 'assets/discussions.css'
				}
			}
		},
		hinting: false,
		derequire: {
			patterns: [
				{
					from: 'define',
					to: 'mefine'
				},
				{
					from: 'require',
					to: 'mequire'
				}
			]
		}
	});

	// Files below are concatenated to assets/vendor.js
	app.import(app.bowerDirectory + '/script.js/dist/script.js');
	app.import(app.bowerDirectory + '/fastclick/lib/fastclick.js');
	app.import(app.bowerDirectory + '/hammerjs/hammer.js');
	app.import(app.bowerDirectory + '/headroom.js/dist/headroom.js');
	app.import(app.bowerDirectory + '/jquery.cookie/jquery.cookie.js');
	app.import(app.bowerDirectory + '/ember-hammer/ember-hammer.js');
	app.import(app.bowerDirectory + '/i18next/i18next.js');
	app.import(app.bowerDirectory + '/vignette/dist/vignette.js');
	app.import(app.bowerDirectory + '/numeral/numeral.js');
	app.import(app.bowerDirectory + '/weppy/dist/weppy.js');
	app.import(app.bowerDirectory + '/visit-source/dist/visit-source.js');
	app.import(app.bowerDirectory + '/Autolinker.js/dist/Autolinker.min.js');
	app.import(app.bowerDirectory + '/ember-performance-sender/dist/ember-performance-sender.js');
	app.import('vendor/common.js');

	return app.toTree();
};
