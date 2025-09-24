import { apiService } from '../services/api';
// Fetch documents with filters
export async function fetchDocument(params: {
	page?: number;
	size?: number;
	search?: string;
	sort?: string;
	userIds?: string | number | (string | number)[];
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
	if (params.startDate !== undefined) query.append('startDate', params.startDate);
	if (params.endDate !== undefined) query.append('endDate', params.endDate);
	if (params.scheduleStatus !== undefined) query.append('scheduleStatus', params.scheduleStatus);

		const url = `/api/document/?${query.toString()}`;
		const response = await apiService.get(url);
		console.log('[API] fetchDocument response:', response);
		return response;
}
// Fetch definition sections by formDefinitionId and status

export async function fetchDefinitionSections({ formDefinitionId, status }: { formDefinitionId: string | number, status: string }) {
	if (!formDefinitionId) return [];
	const url = `/api/forms/definitionSections?formDefinitionId=${formDefinitionId}&status=${status}`;
	const response = await apiService.get(url) as { data?: { content?: any[] } };
	console.log("response", response);
	
	// If using fetch, replace with fetch(url) and await response.json()
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
