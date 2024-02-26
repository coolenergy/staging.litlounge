import { ITokenPackage, ITokenPackageCreate, ITokenPackageSearch } from './../interfaces/token-package';
import {APIRequest, IResponse} from './api-request';
import { Http2ServerRequest } from 'http2';

class TokenPackageService extends APIRequest {
  create(payload: ITokenPackageCreate) {
    return this.post("/admin/package/token", payload)
  }
  list(query?: { [key: string]: any }) {
    return this.get(this.buildUrl("/admin/package/token/search", query))
  }
  update(id: string, payload: ITokenPackageCreate ) {
    return this.put("/admin/package/token/"+id, payload)
  }
  delete(id: string) {
    return this.del("/admin/package/token/"+id)
  }
  findOne(id: string) {
    return this.get("/admin/package/token/"+id+"/view")
  }

}
export const tokenPackageService = new TokenPackageService();