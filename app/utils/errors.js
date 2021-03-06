import {defineError} from 'ember-exex/error';

const DesignSystemFetchError = defineError({
	name: 'DesignSystemFetchError',
	message: `Design System data couldn't be fetched`
});

const DontLogMeError = defineError({
	name: 'DontLogMeError',
	message: `Hack: this error was created only to stop executing Ember and redirect immediately`
});

const WikiVariablesRedirectError = defineError({
	name: 'WikiVariablesRedirectError',
	message: `The API response was in incorrect format`,
	extends: DontLogMeError
});

const UserLoadDetailsFetchError = defineError({
	name: 'UserLoadDetailsFetchError',
	message: `User details couldn't be fetched`
});

const UserLoadInfoFetchError = defineError({
	name: 'UserLoadInfoFetchError',
	message: `User info couldn't be fetched`
});

const TrackingDimensionsFetchError = defineError({
	name: 'TrackingDimensionsFetchError',
	message: `Tracking dimensions couldn't be fetched`
});

const WikiPageFetchError = defineError({
	name: 'WikiPageFetchError',
	message: `Wiki page couldn't be fetched`
});

const WikiVariablesFetchError = defineError({
	name: 'WikiVariablesFetchError',
	message: `Wiki variables couldn't be fetched`
});

const getFetchErrorMessage = function (response) {
	const contentType = response.headers.get('content-type');

	if (contentType && contentType.indexOf('application/json') !== -1) {
		return response.json();
	} else {
		return response.text();
	}
};

export {
	getFetchErrorMessage,
	DesignSystemFetchError,
	DontLogMeError,
	WikiVariablesRedirectError,
	UserLoadDetailsFetchError,
	UserLoadInfoFetchError,
	TrackingDimensionsFetchError,
	WikiPageFetchError,
	WikiVariablesFetchError,
};
