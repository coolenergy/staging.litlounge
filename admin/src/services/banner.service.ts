import { APIRequest } from './api-request';

export class BannerService extends APIRequest {
  create(data) {
    return this.post('/admin/banners', data)
  }
  uploadBanner(file: File, payload: any, onProgress?: Function) {
    return this.upload(
      '/admin/banners/upload',
      [
        {
          fieldname: 'banner',
          file
        },
      ],
      {
        onProgress,
        customData: payload
      },
    );
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/banners/search', query));
  }

  findById(id: string) {
    return this.get(`/admin/banners/${id}/view`);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/banners/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/banners/${id}`);
  }
}

export const bannerService = new BannerService();
