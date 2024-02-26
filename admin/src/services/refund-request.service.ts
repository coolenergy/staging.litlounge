import { APIRequest } from './api-request';

export class RefundRequestService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/refund-requests/search', query)
    );
  };
  update(id: string, payload: any) {
    return this.post(`/refund-requests/status/${id}`, payload);
  };
}

export const refundRequestService = new RefundRequestService();
