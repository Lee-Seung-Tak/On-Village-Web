//src/lib/api.ts

import axios from "axios";


const base = import.meta.env.VITE_API_BASE ?? "/api";


export const api = axios.create({ baseURL: base });
export const elderApi = axios.create({ baseURL: `${base}/elder` });
export const govApi = axios.create({ baseURL: `${base}/gov` });