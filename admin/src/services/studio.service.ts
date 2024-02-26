import { APIRequest } from './api-request';
import { getGlobalConfig } from './config';

export class StudioService extends APIRequest {
  create(payload: any) {
    return this.post('/studio/register', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/studio/${id}/update`, payload);
  }

  search(query?: { [key: string]: any }, headers?: any) {
    return this.get(this.buildUrl('/studio/search', query), headers);
  }

  findById(id: string) {
    return this.get(`/studio/${id}/view`);
  }

  updateStudioCommission(id: string, payload: any) {
    return this.put(`/studio/commission/${id}`, payload);
  }

  getUploadDocumentUrl(id?: string) {
    const config = getGlobalConfig();
    if (id) {
      return `${config.NEXT_PUBLIC_API_ENDPOINT}/studio/${id}/documents/upload`;
    } else {
      return `${config.NEXT_PUBLIC_API_ENDPOINT}/studio/documents/upload`;
    }
  }
}

export const studioService = new StudioService();
