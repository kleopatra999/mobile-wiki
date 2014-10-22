/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/ember/ember.d.ts" />
declare var $: JQueryStatic;
declare var require: (deps: string[], func: Function) => void;

declare module Mercury {
	var provide: (str: any, obj: any) => any;
	var language: string;
	var article: any;
	var _state: {
		firstPage: boolean;
		translations: any;
	};
	var error: any;
	var wiki: any;
	var ads: {
		slots: string[][];
	};
	var apiBase: string;
	var tracking: any;
	var environment: string;
}

declare var M: typeof Mercury.Utils;

interface Location {
	origin: string;
}