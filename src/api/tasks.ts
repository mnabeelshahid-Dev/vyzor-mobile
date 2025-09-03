import { apiService } from '../services/api';

export interface TaskParams {
  startDate?: string;
  endDate?: string;
  siteIds?: (string | number)[];
  userIds?: (string | number)[];
  scheduleStatus?: string;
  search?: string;
  sort?: 'asc' | 'desc';
  sortField?: 'name' | 'number';
  page?: number;
  size?: number;
}

export async function fetchTasks(params: TaskParams) {
  // Build query string
  const query: string[] = [];
  if (params.startDate) query.push(`startDate=${encodeURIComponent(params.startDate)}`);
  if (params.endDate) query.push(`endDate=${encodeURIComponent(params.endDate)}`);
  if (params.siteIds && params.siteIds.length) query.push(`siteIds=${params.siteIds.join(',')}`);
  if (params.userIds && params.userIds.length) query.push(`userIds=${params.userIds.join(',')}`);
  if (params.scheduleStatus) query.push(`scheduleStatus=${params.scheduleStatus}`);
  if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
  if (params.sort) query.push(`sort=${params.sort}`);
  if (params.sortField) query.push(`sortField=${params.sortField}`);
  if (params.page !== undefined) query.push(`page=${params.page}`);
  if (params.size !== undefined) query.push(`size=${params.size}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  const url = `/api/document/${qs}`;
  console.log(`🌐 [API] GET https://vyzor.app${url}`);
  console.debug('debug.ts:94 Request:', { headers: apiService, body: undefined });
  const response = await apiService.get(url);
  console.debug(`debug.ts:206 ✅ [SUCCESS] API Response ${response || 200}`, { url: `https://vyzor.app${url}`, data: response });
  return response;
}
