import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import {test, moduleForComponent} from 'ember-qunit';

moduleForComponent('infobox-builder', 'Integration | Component | infobox builder', {
	integration: true
});

test('reset item in edit mode on clicking preview background', function (assert) {
	const setEditItemSpy = sinon.spy(),
		removeItemMock = () => {},
		previewSelector = 'div.infobox-builder-preview';

	this.setProperties({
		setEditItem: setEditItemSpy,
		removeItem: removeItemMock
	});

	this.render(hbs`{{infobox-builder setEditItem=(action setEditItem) removeItem=(action removeItem)}}`);

	this.$(previewSelector).click();

	assert.equal(setEditItemSpy.called, true);
	assert.equal(setEditItemSpy.calledWith(null), true);
});

