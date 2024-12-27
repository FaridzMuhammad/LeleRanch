import axios from "axios";
import https from "https";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, 
  }),
});

export default api;
