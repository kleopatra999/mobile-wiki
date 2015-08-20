/// <reference path="../app.ts" />
'use strict';
interface AlertNotification {
	message: string;
	type?: string;
	expiry?: number;
	unsafe?: boolean;
	callbacks?: any;
}

App.AlertNotificationsComponent = Em.Component.extend({
	classNames: ['alert-notifications'],

	alerts: null,

	actions: {
		dismissAlert: function (alert: AlertNotification): void {
			this.get('alerts').removeObject(alert);
		}
	}
});
