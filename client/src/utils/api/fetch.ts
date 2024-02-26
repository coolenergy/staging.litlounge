import { api } from "./api";
import { Response } from "./response";

export async function fetch<T>(url: string) {
  return api.get<Response<T>>(url).then(({ data }) => data.data);
}
