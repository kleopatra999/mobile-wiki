var gulp = require('gulp'),
	gutil = require('gulp-util'),
	log = require('../util/logger'),
	paths = require('../paths');

gulp.task('watch', function () {
	log('Watching files');

	gulp.watch(paths.styles.watch, ['sass']).on('change', function (event) {
        /*
		 * Baseline is a scss file that gets inlined, so the views must be recompiled
		 * when it is changed
         */
		if (event.path.match('baseline.scss')) {
			gulp.start('views');
		}
		log('Style changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.scripts.front.src, ['scripts-front']).on('change', function (event) {
		log('Script changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.templates.src, ['templates']).on('change', function (event) {
		log('Template changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.svg.src, ['sprites']).on('change', function (event) {
		log('Svg changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.scripts.back.src, ['scripts-back']).on('change', function (event) {
		log('Script for backend changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.views.src, ['views']).on('change', function (event) {
		log('Views changed:', gutil.colors.green(event.path));
	});
});
