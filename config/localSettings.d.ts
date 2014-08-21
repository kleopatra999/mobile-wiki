interface CacheInterface {
	engine: string;
	name: string;
	location?: any;
	shared?: boolean;
}

interface LocalSettings {
	host: any;
	port: number;
	maxRequestsPerChild: number;
	workerCount: number;
	environment: any;
	mediawikiHost: string;
	gaId: string;
	mediawikiCacheBuster: string;
	cache: CacheInterface;
}
