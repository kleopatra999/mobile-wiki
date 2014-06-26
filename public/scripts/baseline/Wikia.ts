
module Wikia {
		'use strict';
		document.documentElement.className += ' preload';

		function namespacer(str, ns, val) {
			var parts, i;

			if (!str) {
				parts = [];
			} else {
				parts = str.split('.');
			}

			if (parts.length === 1 && !ns) {
				throw new Error('Uneccessary assignment, please specify more items in arg1 or a namespace in arg2');
			}

			if (!ns) {
				ns = window;
			}

			if (typeof ns === 'string') {
				ns = window[ns] = window[ns] || {};
			}

			for (i = 0; i < parts.length; i++) {
				// if a obj is passed in and loop is assigning last variable in namespace
				if (i === parts.length - 1) {
					ns = ns[parts[i]] = val;
				} else {
					// if namespace doesn't exist, instantiate as empty object
					ns = ns[parts[i]] = ns[parts[i]] || {};
				}
			}
			return ns;
		}

		namespacer(null, 'Wikia', {});

		export var provide = function (str, obj) {
			if (typeof str !== 'string') {
				throw Error('Invalid string supplied to namespacer');
			}
			return namespacer(str, 'Wikia', obj);
		};
}
