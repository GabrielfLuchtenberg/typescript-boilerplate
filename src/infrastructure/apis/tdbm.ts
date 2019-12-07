import axios from "axios";

const apiVersion = 3;
const tdbmApi = axios.create({
  baseURL: `https://api.themoviedb.org/${apiVersion}`
});

tdbmApi.interceptors.request.use(config => {
  config.params = { ...config.params, api_key: process.env.TDBM_KEY };
  return config;
});

export { tdbmApi };
