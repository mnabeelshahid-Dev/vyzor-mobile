
import { apiService } from '../services/api';
// Fetch documents with filters
export async function fetchDocument(params: {
	page?: number;
	size?: number;
	search?: string;
	sort?: string;
	userIds?: string | number | (string | number)[];
	siteIds?: string | number | (string | number)[];
	startDate?: string;
	endDate?: string;
	scheduleStatus?: string;
}) {
	const query = new URLSearchParams();
	if (params.page !== undefined) query.append('page', params.page.toString());
	if (params.size !== undefined) query.append('size', params.size.toString());
	if (params.search !== undefined) query.append('search', params.search);
	if (params.sort !== undefined) query.append('sort', params.sort);
	if (params.userIds !== undefined) {
		if (Array.isArray(params.userIds)) {
			query.append('userIds', params.userIds.join(','));
		} else {
			query.append('userIds', params.userIds.toString());
		}
	}
	if (params.siteIds !== undefined) {
		if (Array.isArray(params.siteIds)) {
			query.append('siteIds', params.siteIds.join(','));
		} else {
			query.append('siteIds', params.siteIds.toString());
		}
	}
	if (params.startDate !== undefined) query.append('startDate', params.startDate);
	if (params.endDate !== undefined) query.append('endDate', params.endDate);
	if (params.scheduleStatus !== undefined) query.append('scheduleStatus', params.scheduleStatus);

	const url = `/api/document/?${query.toString()}`;
	const response = await apiService.get(url);
	console.log('[API] fetchDocument response:', response);
	return response;
}
// Fetch definition sections by formDefinitionId and status

export async function fetchDefinitionSections() {
	const url = `/api/forms/sections/all?size=100`;
	const response = await apiService.get(url) as { data?: { content?: any[] } };
	return response?.data || [];
}





export async function fetchStatisticsUserDetail(params: {
	page?: number;
	status?: string;
	userIds?: string | number | (string | number)[];
	filterSiteIds?: string | number | (string | number)[];
	size?: number;
	search?: string;
	sort?: string;
	startDate?: string;
	endDate?: string;
}) {
	const query = new URLSearchParams();
	if (params.page !== undefined) query.append('page', params.page.toString());
	if (params.size !== undefined) query.append('size', params.size.toString());
	if (params.status && params.status.trim() !== '') query.append('status', params.status);
	if (params.userIds && Array.isArray(params.userIds) && params.userIds.length > 0) {
		query.append('userIds', params.userIds.join(','));
	} else if (params.userIds) {
		query.append('userIds', params.userIds.toString());
	}
	if (params.filterSiteIds && Array.isArray(params.filterSiteIds) && params.filterSiteIds.length > 0) {
		query.append('filterSiteIds', params.filterSiteIds.join(','));
	} else if (params.filterSiteIds) {
		query.append('filterSiteIds', params.filterSiteIds.toString());
	}
	if (params.search && params.search.trim() !== '') query.append('search', params.search);
	if (params.sort && params.sort.trim() !== '') query.append('sort', params.sort);
	if (params.startDate && params.startDate.trim() !== '') query.append('startDate', params.startDate);
	if (params.endDate && params.endDate.trim() !== '') query.append('endDate', params.endDate);

	const url = `/api/document/statistics/usersDetail?${query.toString()}`;
	return apiService.get(url);
}

type ControlValue = string | number | boolean | string[] | number[] | boolean[] | null;

// Helper: normalize axios/fetch-like errors
function normalizeHttpError(err: any, url?: string) {
	const status = err?.response?.status ?? err?.status ?? 0;
	const data = err?.response?.data ?? err?.data;
	const message =
		(typeof data === 'string' && data) ||
		data?.message ||
		err?.message ||
		'Request failed';
	const finalUrl = err?.config?.url ?? url ?? '';
	return { status, data, message, url: finalUrl };
}

export async function syncDocument(
	documentId: string | number,
	body: {
		formDefinitionId: number;
		status: string;
		userAccountId: number;
		clientId: number;
		siteId: number;
		flow: number;
		deleted: boolean;
		completedDate: string;
		key?: string | null;
		sectionModels: Array<{
			startDate: string;
			endDate: string;
			key: string | number;
			formConfigurationSectionId: number;
			documentId: number | string;
			userId: number | string;
			data: Array<{
				value: ControlValue;
				controlId: string | number;
				groupName: string | null;
				senserData: any;
			}>;
		}>;
	}
) {
	const url = `/api/document/sync/${documentId}`;
	try {
		console.log('[API] syncDocument network request:', {
			method: 'PUT',
			url: `/api/document/sync/${documentId}`,
			data: body,
		});
		const res = await apiService.put(`/api/document/sync/${documentId}`, body);
		return res.data;
	} catch (err: any) {
		const n = normalizeHttpError(err, url);
		console.error(`[API] syncDocument error [HTTP ${n.status || 'n/a'}] ${n.url}`);
		if (n.data) console.error('[API] error body:', n.data);
		console.error('[API] error message:', n.message);
		throw Object.assign(new Error(n.message), { status: n.status, data: n.data, url: n.url });
	}
}
const c = console;
(globalThis as any).Debugconsole = (globalThis as any).Debugconsole ?? {
	log: c.log.bind(c),
	info: c.info.bind(c),
	warn: c.warn.bind(c),
	error: c.error.bind(c),
	debug: c.debug.bind(c),
};
// Fetch section rows by sectionId
export async function fetchSectionRows(sectionId: string | number) {
	const url = `/api/forms/sectionRows?sectionId=${sectionId}`;
	const response = await apiService.get(url);
	return response;
}


// Fetch lookup options by lookup name
export async function fetchLookupOptions(lookupName: string) {
	const url = `/api/static-data/filter/LOOKUP_FILTER/filters?filter[lookupName]=${lookupName}`;
	const response = await apiService.get(url);
	return response;
}

// Fetch file URL by fileId
export async function fetchFileUrl(fileId: string) {
	const url = `/api/dms/file/url/${fileId}`;

	try {
		// Get auth token
		const { storage } = await import('../services/storage');
		let token: string | null = null;
		try {
			token = await storage.getSecureString('access_token');
		} catch (error) {
			console.warn('Failed to retrieve auth token', error);
		}

		// Make direct fetch request to avoid JSON parsing issues
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'text/plain, */*', // Accept text responses
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`https://vyzor.app${url}`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// Always get text response to avoid JSON parsing issues
		const textData = await response.text();

		// Extract redirect URL from the response
		const redirectMatch = textData.match(/redirect:([^\s]+)/);
		if (redirectMatch) {
			return { data: { redirect: redirectMatch[1] } };
		}

		// If no redirect found, return the text as is
		return { data: { redirect: textData } };
	} catch (error) {
		console.error('Error fetching file URL:', error);
		throw error;
	}
}

export async function fetchMediaUrl(fileId: string) {
	const url = `/api/dms/file/url/${fileId}`;

	try {
		// Get auth token
		const { storage } = await import('../services/storage');
		let token: string | null = null;

		try {
			token = await storage.getSecureString('access_token');
		} catch (error) {
			console.warn('Failed to retrieve auth token', error);
		}

		const headers: Record<string, string> = {
			Accept: 'text/plain, */*',
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		// Fetch from backend
		const response = await fetch(`https://vyzor.app${url}`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// Get plain text (the actual URL)
		const redirectUrl = await response.text();

		// Trim unwanted quotes or whitespace
		const cleanUrl = redirectUrl.replace(/^"|"$/g, '').trim();

		// Return full usable URL
		return { data: { redirect: cleanUrl } };
	} catch (error) {
		console.error('Error fetching media URL:', error);
		throw error;
	}
}

export function normalizeMediaUrl(u?: string | null): string | null {
	if (!u) return null;
	let s = String(u).trim().replace(/^redirect:/i, '').replace(/^["']|["']$/g, '');

	// already a data URI
	if (s.startsWith('data:')) return s;

	// protocol-less (//example.com/...) -> add https:
	if (/^\/\/[^/]/.test(s)) s = 'https:' + s;

	// local file path (android / ios) - ensure file:// prefix
	if (/^\/[^\s]/.test(s)) s = 'file://' + s;

	// only accept http(s), file, or data
	if (/^https?:\/\//i.test(s) || s.startsWith('file://')) return s;

	// sometimes backend returns base64 string without data: prefix
	// detect base64 by characters and length heuristic (very approximate)
	if (/^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 100) {
		// can't know mime type; caller must handle this case (we prefix image/png as fallback)
		return `data:image/png;base64,${s}`;
	}

	return null;
}
