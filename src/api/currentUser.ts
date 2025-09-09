import { apiService } from '../services/api';

export async function fetchCurrentUser() {
  return apiService.get('/api/security/userAccounts/currentUser/');
}
