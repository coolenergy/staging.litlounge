import { APIRequest } from './api-request';
import { getGlobalConfig } from './config';
export class PerformerService extends APIRequest {
  create(payload: any) {
    return this.post('/admin/performers', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/performers/${id}`, payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/performers/search', query));
  }

  searchOnline(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/performers/online', query));
  }

  findById(id: string) {
    return this.get(`/admin/performers/${id}/view`);
  }

  getUploadDocumentUrl(id?: string) {
    const config = getGlobalConfig();
    return `${config.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/documents/upload`;
  }

  getAvatarUploadUrl() {
    const config = getGlobalConfig();
    return `${config.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/avatar/upload`;
  }

  getHeaderUploadUrl() {
    const config = getGlobalConfig();
    return `${config.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/header/upload`;
  }

  updateCommissionSetting(id: string, payload: any) {
    return this.put(`/admin/performer-commission/${id}`, payload);
  }

  exportCsv(query?: { [key: string]: any }) {
    const config = getGlobalConfig();
    return (
      config.NEXT_PUBLIC_API_ENDPOINT +
      this.buildUrl('/admin/performers/export/csv', {
        ...query
      })
    );
  }
}

export const performerService = new PerformerService();
