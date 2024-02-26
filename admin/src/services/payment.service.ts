import { APIRequest } from './api-request';

export class PaymentService extends APIRequest {
  search(query) {
    return this.get(this.buildUrl('/transactions/admin/search', query));
  }

  paymentInformationSearch(query) {
    return this.get(this.buildUrl('/payment-information/search', query));
  }

  detail(id: string) {
    return this.get('/payment-information/' + id + '/view' );
  }
}

export const paymentService = new PaymentService();
