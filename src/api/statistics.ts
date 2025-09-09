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
