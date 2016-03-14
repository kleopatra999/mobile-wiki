QUnit.module('M.tracker.UniversalAnalytics (loaded with baseline)', function (hooks) {
	var queue,
		dimensions = [];

	dimensions[8] = 'test/article';

	/**
	 * @param {Object} x
	 * @param {Object} y
	 * @returns {boolean}
	 */
	function objectEquals(x, y) {
		var p;

		if (x === null || x === undefined || y === null || y === undefined) {
			return x === y;
		}
		// after this just checking type of one would be enough
		if (x.constructor !== y.constructor) {
			return false;
		}
		// if they are functions, they should exactly refer to same one (because of closures)
		if (x instanceof Function) {
			return x === y;
		}
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (x instanceof RegExp) {
			return x === y;
		}
		if (x === y || x.valueOf() === y.valueOf()) {
			return true;
		}
		if (Array.isArray(x) && x.length !== y.length) {
			return false;
		}

		// if they are dates, they must had equal valueOf
		if (x instanceof Date) {
			return false;
		}

		// if they are strictly equal, they both need to be object at least
		if (!(x instanceof Object)) {
			return false;
		}
		if (!(y instanceof Object)) {
			return false;
		}

		// recursive object equality check
		p = Object.keys(x);

		return Object.keys(y).every(function (i) {
			return p.indexOf(i) !== -1;
		}) && p.every(function (i) {
			return objectEquals(x[i], y[i]);
		});
	}


	/**
	 * @param {*} command
	 * @returns {int}
	 */
	function queueCount(command) {
		var count = 0,
			i = 0;

		for (; i < queue.length; i++) {
			if (queue[i][0] === command) {
				count++;
			}
		}

		return count;
	}

	/**
	 * @param {*} commandArray
	 * @returns {boolean}
	 */
	function queueContains(commandArray) {
		var i = 0;

		for (; i < queue.length; i++) {
			if (objectEquals(queue[i], commandArray)) {
				return true;
			}
		}

		return false;
	}

	hooks.beforeEach(function () {
		M.props({
			tracking: {
				ua: {
					primary: {
						id: '123',
						sampleRate: 10
					},
					ads: {
						prefix: 'ads',
						id: '789',
						sampleRate: 100
					}
				}
			},
			gaUserIdHash: 'foo'
			// instantiate with mutation because tests are run multiple times
		}, true);

		// Mock Analytics Interface queue
		queue = [];
		window.ga = function () {
			queue.push(Array.prototype.slice.call(arguments));
		};
	});

	QUnit.test('UniversalAnalytics initializer', function (assert) {
		M.tracker.UniversalAnalytics.initialize(dimensions);

		assert.strictEqual(queueCount('create'), 2);
		assert.strictEqual(queueCount('require'), 1);
		assert.strictEqual(queueCount('ads.require'), 1);

		assert.ok(queueContains([
			'create', '123', 'auto',
			{name: '', allowLinker: true, sampleRate: 10, userId: 'foo'}
		]));
		assert.ok(queueContains([
			'create', '789', 'auto',
			{name: 'ads', allowLinker: true, sampleRate: 100, userId: 'foo'}
		]));
	});

	QUnit.test('Track event', function (assert) {
		M.tracker.UniversalAnalytics.initialize(dimensions);
		M.tracker.UniversalAnalytics.track('category', 'action', 'label', 42, true);

		assert.ok(queueContains([
			'send',
			{
				hitType: 'event',
				eventCategory: 'category',
				eventAction: 'action',
				eventLabel: 'label',
				eventValue: 42,
				nonInteraction: true
			}
		]));
	});

	QUnit.test('Track page view', function (assert) {
		M.tracker.UniversalAnalytics.initialize(dimensions);
		M.tracker.UniversalAnalytics.trackPageView();

		assert.ok(queueContains(['send', 'pageview']));
	});

	QUnit.test('Track ads-related event', function (assert) {
		M.tracker.UniversalAnalytics.initialize(dimensions);
		M.tracker.UniversalAnalytics.trackAds('testCategory', 'testAction', 'testLabel', 0, true);

		assert.ok(queueContains([
			'ads.send',
			{
				hitType: 'event',
				eventCategory: 'testCategory',
				eventAction: 'testAction',
				eventLabel: 'testLabel',
				eventValue: 0,
				nonInteraction: true
			}
		]));
	});
});
