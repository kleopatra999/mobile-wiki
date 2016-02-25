/**
 * All supported namespaces
 */
const supportedNamespaces = [0, 14],
	/**
	 * This list is taken from MediaWiki:app/includes/Defines.php
	 * @type {{name: number}}
	 */
	namespace = {
		// virtual namespaces
		MEDIA: -2,
		SPECIAL: -1,
		// real namespaces
		MAIN: 0,
		TALK: 1,
		USER: 2,
		USER_TALK: 3,
		PROJECT: 4,
		PROJECT_TALK: 5,
		FILE: 6,
		FILE_TALK: 7,
		MEDIAWIKI: 8,
		MEDIAWIKI_TALK: 9,
		TEMPLATE: 10,
		TEMPLATE_TALK: 11,
		HELP: 12,
		HELP_TALK: 13,
		CATEGORY: 14,
		CATEGORY_TALK: 15,
		IMAGE: 6,
		IMAGE_TALK: 7
	};

/**
 * Returns current MW namespace if we're supporting them, false otherwise
 *
 * @returns {*}
 */
function getCurrentNamespace() {
	const ns = parseInt(M.prop('mediaWikiNamespace'), 10);

	if (supportedNamespaces.indexOf(ns) > -1) {
		return ns;
	}

	return false;
}

/**
 * @returns {boolean}
 */
function isContentNamespace() {
	// In the future this method would be more sophisticated
	// because each wiki can have its own content namespaces defined
	return parseInt(M.prop('mediaWikiNamespace'), 10) === 0;
}

export {namespace, supportedNamespaces, getCurrentNamespace, isContentNamespace};