import { APIRequest } from './api-request';

export class PayoutRequestService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/payout-requests/search', query)
    );
  };
  update(id: string, payload: any) {
    return this.post(`/payout-requests/status/${id}`, payload);
  };
  findById(id: string) {
    return this.get(`/payout-requests/admin/${id}`)
  }
}

export const payoutRequestService = new PayoutRequestService();
