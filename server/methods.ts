import indexController = require('./controllers/home/index');
import article = require('./controllers/article/index');
import comments = require('./controllers/article/comments');

function methods(server): void {
	var second,
	    cacheOptions;

	second = 1000;
	cacheOptions = {
		cache: {
			expiresIn: 60 * second,
			staleIn: 10 * second,
			staleTimeout: 100
			   },
		generateKey: (opts) => {
			return JSON.stringify(opts);
		}
	};

	server.method('getPrerenderedData', indexController, cacheOptions);

	server.method('getArticleData', (params, next) => {
		article.createFullArticle(false, params, (data) => {
			next(null, data);
		}, (err) => {
			next(err);
		});
	}, cacheOptions);

	server.method('getArticleComments', (params, next) => {

		comments.handleRoute(params, (data) => {
			console.log(data);
			next(null, data);
		}, (err) => {
			next(err);
		});
	}, cacheOptions);
};

export = methods;

