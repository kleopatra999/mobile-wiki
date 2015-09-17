interface LoggerData {
	severity: string;
	url: string;
	data: any;
}

class AuthLogger {
	static baseUrl: string = 'https://services.wikia.com/clickstream/events/social';

	static log(data: any, severity: string): void {
		var loggerXhr = new XMLHttpRequest(),
			loggerData = AuthLogger.getLoggerData(data, severity);
		loggerXhr.open('POST', AuthLogger.baseUrl, true);
		loggerXhr.withCredentials = true;
		loggerXhr.setRequestHeader('Content-type', 'application/json');
		loggerXhr.send(loggerData);
	}

	static getLoggerData(data: any, severity: string): LoggerData {
		return {
			severity: severity,
			url: window.location.href,
			data: data
		}
	}

	static error(data: any): void {
		AuthLogger.log(data, 'error');
	}
}
