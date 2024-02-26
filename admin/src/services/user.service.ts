import { APIRequest, IResponse } from './api-request';
import { IUser } from 'src/interfaces';
import { authService } from '@services/index';
import { getGlobalConfig } from './config';

export class UserService extends APIRequest {
  me(headers?: { [key: string]: string }): Promise<IResponse<IUser>> {
    return this.get('/users/me', headers);
  }

  updateMe(payload: any) {
    return this.put('/admin/users', payload);
  }

  create(payload: any) {
    return this.post('/admin/users', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/users/${id}`, payload);
  }

  getAvatarUploadUrl(userId?: string) {
    const config = getGlobalConfig();
    if (userId) {
      return `${config.NEXT_PUBLIC_API_ENDPOINT}/admin/users/${userId}/avatar/upload`;
    }
    return `${config.NEXT_PUBLIC_API_ENDPOINT}/users/avatar/upload`;
  }

  uploadAvatarUser(file: File, userId?: string) {
    return this.upload(`/admin/users/${userId}/avatar/upload`, [
      { file, fieldname: 'avatar' }
    ]);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/users/search', query));
  }

  findById(id: string) {
    return this.get(`/admin/users/${id}/view`);
  }

  exportCsv(query?: { [key: string]: any }) {
    const config = getGlobalConfig();
    return (
      config.NEXT_PUBLIC_API_ENDPOINT +
      this.buildUrl('/admin/users/export/csv', {
        ...query
      })
    );
  }
}

export const userService = new UserService();
