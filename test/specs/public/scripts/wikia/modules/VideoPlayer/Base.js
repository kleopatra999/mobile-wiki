QUnit.module('VideoPlayer.BasePlayer', {
	setup: function () {
		var params = {
			videoId: 666
		};
		this.player = new Wikia.Modules.VideoPlayer.BasePlayer('base', params);
	},
	teardown: function () {
	}
});

QUnit.test('Player requires a provider', function () {
	expect(1);
	var error = new Error('VideoPlayer requires a provider as the first argument');
	throws(Wikia.Modules.VideoPlayer.BasePlayer, error);
});

QUnit.test('loadPlayer calls W.load and playerDidLoad hook', function () {
	expect(3);

	var stub = this.stub(W, 'load');
	stub.callsArg(1);
	this.spy(this.player, 'playerDidLoad');

	equal(this.player.playerDidLoad.calledOnce, false, 'playerDidLoad.calledOnce should start at false');

	this.player.loadPlayer();

	ok(W.load.calledOnce, 'W.load was called');
	ok(this.player.playerDidLoad.calledOnce, 'the playerDidLoad hook fired appropriately');
});

QUnit.test('createUniqueId', function () {
	var ele = document.createElement('div'),
		id = 'videoPlayerTest',
		newId;

	ele.id = id;
	newId = this.player.createUniqueId(id);
	document.body.appendChild(ele);

	equal(typeof parseInt(newId.slice(id.length), 10), 'number', 'Appends a UNIX timestamp');
	ok(newId.length === id.length + 13, 'Appends a UNIX timestamp');
});

QUnit.test('local track calls W.track with extended params', function () {
	this.stub(W, 'track', function (event, opts) {
		equal(event, 'test');
		equal(opts.foo, 'bar', 'params are properly extended');
		equal(opts.trackingMethod, 'both', 'params are properly extended');
	});

	this.player.track('test', {foo: 'bar'});
	ok(W.track.calledOnce);
});
