import { apiService } from '../services/api';
import { ApiResponse } from '../types';

export interface Branch {
  id: string;
  name: string;
  number: string;
  // Add other fields as needed
}

export interface BranchesParams {
  search?: string;
  sortField?: 'name' | 'code' | 'createdDate';
  sortOrder?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  size?: number;
  city?: string;
  state?: string;
  postalCode?: string;
}

export async function fetchBranches(params?: BranchesParams): Promise<ApiResponse<any>> {
  // Build query string
  const query: string[] = [];
  // Default params
  query.push(`status=${params?.status || 'ACTIVE'}`);
  query.push(`size=${params?.size ?? (params?.search ? 20 : 10000)}`);
  if (params?.page !== undefined) query.push(`page=${params.page}`);
  if (params?.search) query.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.city) query.push(`city=${encodeURIComponent(params.city)}`);
  if (params?.state) query.push(`state=${encodeURIComponent(params.state)}`);
  if (params?.postalCode) query.push(`postalCode=${encodeURIComponent(params.postalCode)}`);
  // Sorting
  if (params?.sortField && params?.sortOrder) {
    query.push(`sort=${params.sortField},${params.sortOrder}`);
  } else if (params?.sortField) {
    query.push(`sort=${params.sortField},asc`);
  }
  // Default sort for search
  if (params?.search && !params?.sortField) {
    query.push(`sort=createdDate,desc`);
  }
  const qs = query.length ? `?${query.join('&')}` : '';
  return apiService.get<any>(`/api/site/sites${qs}`);
}
