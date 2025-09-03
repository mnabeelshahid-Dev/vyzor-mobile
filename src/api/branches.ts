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
  sort?: 'asc' | 'desc';
  sortField?: 'name' | 'number';
}

export async function fetchBranches(params?: BranchesParams): Promise<ApiResponse<any>> {
  // Build query string
  const query: string[] = [];
  if (params?.search) query.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.sort) query.push(`sort=${params.sort}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  return apiService.get<any>(`/api/site/sites${qs}`);
}
