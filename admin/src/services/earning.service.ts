import { APIRequest } from './api-request';

class EarningService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/earning/admin/search', query));
  }

  stats(params?: { [key: string]: any }) {
    return this.get(this.buildUrl('/earning/admin/stats', params));
  }
}
export const earningService = new EarningService();
