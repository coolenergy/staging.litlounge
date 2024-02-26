import axios from "axios";
import { localStorageUtils } from "~/utils/local-storage";

const api = axios.create({
  baseURL: process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT,
});

api.interceptors.request.use((config) => {
  const jwt = localStorageUtils.get<string>("jwt");
  if (jwt) {
    config.headers.Authorization = jwt;
  }
  return config;
});

export { api };
