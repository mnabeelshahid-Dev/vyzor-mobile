// Fetch definition sections by formDefinitionId and status
export async function fetchDefinitionSections({ formDefinitionId, status }: { formDefinitionId: string | number, status: string }) {
	if (!formDefinitionId) return [];
	const url = `/api/forms/definitionSections?formDefinitionId=${formDefinitionId}&status=${status}`;
	const response = await apiService.get(url) as { data?: { content?: any[] } };
	console.log("response", response);
	
	// If using fetch, replace with fetch(url) and await response.json()
	return response?.data || [];
}
import { apiService } from '../services/api';

export async function fetchStatisticsUserDetail(params: any) {
	// Build query string from params
	const query = new URLSearchParams();
	if (params.page !== undefined) query.append('page', params.page);
	if (params.status) query.append('status', params.status);
	if (params.size !== undefined) query.append('size', params.size);
	if (params.search) query.append('search', params.search);
	if (params.userId) query.append('userId', params.userId);
	if (params.sort) query.append('sort', params.sort);
	if (params.startDate) query.append('startDate', params.startDate);
	if (params.endDate) query.append('endDate', params.endDate);

	const url = `/api/document/statistics/usersDetail?${query.toString()}`;
	return apiService.get(url);
}
