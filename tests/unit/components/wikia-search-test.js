import sinon from 'sinon';
import {test, moduleForComponent} from 'ember-qunit';


const trackModule = require('mobile-wiki/utils/track');
const urlModule = require('mobile-wiki/utils/url');
let trackStub, buildUrlStub, component;

moduleForComponent('wikia-search', 'Unit | Component | local wikia search', {
	unit: true,

	beforeEach() {
		buildUrlStub = sinon.stub(urlModule, 'buildUrl');
		trackStub = sinon.stub(trackModule, 'track');
		component = this.subject();
		component.set('wikiVariables', {
			host: 'wikia.com'
		});
	},

	afterEach() {
		buildUrlStub.restore();
		trackStub.restore();
	}
});

test('search URI generation', (assert) => {
	const queries = [
		'',
		'query',
		'something that\'s encodable'
	];

	queries.forEach((query) => {
		component.getSearchURI(query);
		assert.ok(
			buildUrlStub.calledWith({
				host: 'wikia.com',
				path: '/wikia.php',
				query: {
					controller: 'MercuryApi',
					method: 'getSearchSuggestions',
					query
				}
			})
		);
	});
});

test('only runs one request for a given query at a time', function (assert) {
	const query = 'query',
		component = this.subject();

	assert.ok(!component.requestInProgress(query),
		'request is not in progess with startedRequest hasn\'t been called');

	component.startedRequest(query);
	assert.ok(component.requestInProgress(query),
		'request is in progess when startedRequest has been called');

	component.endedRequest(query);
	assert.ok(!component.requestInProgress(query),
		'request is no longer in progress with endedRequest has been called');
});

test('cacheResult with one result', function (assert) {
	const query = 'some query',
		suggestions = [{
			id: 123,
			ns: 0,
			quality: 50,
			title: 'some title'
		}],
		component = this.subject();

	component.cacheResult(query, suggestions);
	assert.ok(component.hasCachedResult(query), 'acknowledges that the result is cached');
	assert.equal(suggestions, component.getCachedResult(query), 'correct cached value');
});

test('eviction tests', function (assert) {
	const component = this.subject();

	component.set('cachedResultsLimit', 2);
	assert.ok(!component.needToEvict(), 'needToEvict returns false when cache isn\'t full');

	component.cacheResult('query1', []);
	component.cacheResult('query2', []);
	assert.ok(component.needToEvict(), 'needToEvict returns true when cache is full');

	component.evictCachedResult();
	assert.ok(!component.hasCachedResult('query1') && component.hasCachedResult('query2'),
		'evicts first in cached value, keeps others');
});


test('setSearchSuggestionItems - set suggestions to be empty', function (assert) {
	const component = this.subject();

	component.set('isLoadingResultsSuggestions', true);
	component.set('suggestions', [
		{
			title: 'test'
		}
	]);

	component.setSearchSuggestionItems();

	assert.deepEqual(component.get('suggestions'), [], 'suggestions should be empty after');
	assert.equal(component.get('isLoadingResultsSuggestions'), false, 'isLoadingResultsSuggestions is falsy');
});

test('setSearchSuggestionItems - correctly set suggestions array', function (assert) {
	const component = this.subject(),
		suggestionsFromApi = [
			{
				title: 'suggestion1'
			},
			{
				title: 'suggestion 2!'
			},
			{
				title: 'sug GES %^&*^%&>?<tion>'
			},
			{
				title: 'no query inside'
			},
			{
				title: 'sug sug suggestions sug sug'
			}
		].map((suggestion) => {
			return Ember.Object.create(suggestion);
		}),
		suggestionsAfterProcessing = [
			{
				text: '<span class="wikia-search__suggestion-highlighted">sug</span>gestion1',
				title: 'suggestion1',
				uri: 'suggestion1'
			},
			{
				text: '<span class="wikia-search__suggestion-highlighted">sug</span>gestion 2!',
				title: 'suggestion 2!',
				uri: 'suggestion_2!'
			},
			{
				text: '<span class="wikia-search__suggestion-highlighted">sug</span> GES %^&*^%&>?<tion>',
				title: 'sug GES %^&*^%&>?<tion>',
				uri: 'sug_GES_%25%5E%26*%5E%25%26%3E%3F%3Ction%3E'
			},
			{
				text: 'no query inside',
				title: 'no query inside',
				uri: 'no_query_inside'
			},
			{
				text: '<span class="wikia-search__suggestion-highlighted">sug</span> ' +
				'<span class="wikia-search__suggestion-highlighted">sug</span> ' +
				'<span class="wikia-search__suggestion-highlighted">sug</span>gestions ' +
				'<span class="wikia-search__suggestion-highlighted">sug</span> ' +
				'<span class="wikia-search__suggestion-highlighted">sug</span>',
				title: 'sug sug suggestions sug sug',
				uri: 'sug_sug_suggestions_sug_sug'
			}
		].map((suggestion) => {
			return Ember.Object.create(suggestion);
		});

	// Cache empty array so we don't send an AJAX request
	component.cacheResult('sug', []);
	component.set('phrase', 'sug');
	assert.deepEqual(component.get('suggestions'), [], 'suggestions should be empty at init');

	component.setSearchSuggestionItems(suggestionsFromApi);

	assert.deepEqual(component.get('suggestions'), suggestionsAfterProcessing);
});
