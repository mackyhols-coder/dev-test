import { AxiosInstance } from "axios";
import axiosInstance from "@/utils/axios";

export class BaseService {
    protected _axios: AxiosInstance;
    protected _controller: string;

    constructor(controller: string) {
        this._axios = axiosInstance;
        this._controller = controller;
    }

    async get<T = any>(url: string, params?: any, signal?: AbortSignal): Promise<T> {
        const response = await this._axios.get<T>(`${this._controller}/${url}`, { params, signal });
        return response.data;
    }

    async getById<T = any>(url: string, signal?: AbortSignal): Promise<T> {
        return await this.get<T>(url, { signal });
    }

    async post<T = any, TR = T>(url: string, data: T, signal?: AbortSignal): Promise<TR> {
        const response = await this._axios.post<TR>(`${this._controller}/${url}`, data, { signal });
        return response.data;
    }

    async put<T = any, TR = T>(url: string, data: T, signal?: AbortSignal): Promise<TR> {
        const response = await this._axios.put<TR>(`${this._controller}/${url}`, data, { signal });
        return response.data;
    }
  
    async postFile<TR = any>(url: string, formData: FormData, signal?: AbortSignal): Promise<TR> {
      const response = await this._axios.post<TR>(`${this._controller}/${url}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal
      });
      return response.data;
    }
    
    async create<T = any, TR = T>(data: T, signal?: AbortSignal): Promise<TR> {
        const response = await this._axios.post<TR>(this._controller, data, { signal });
        return response.data;
    }

    async delete(id: string, signal?: AbortSignal): Promise<void> {
        await this._axios.delete(`${this._controller}/${id}`, { signal });
    }

    async update<T = any, TR = T>(id: string, data: T, signal?: AbortSignal): Promise<TR> {
        const response = await this._axios.put<TR>(`${this._controller}/${id}`, data, { signal });
        return response.data;
    }

    async select<T = any>(signal?: AbortSignal): Promise<T[]> {
        const response = await this._axios.get<T[]>(`${this._controller}/select`, { signal });
        return response.data;
    }

    async patch(url: string, signal?: AbortSignal): Promise<void> {
        await this._axios.patch(`${this._controller}/${url}`, {}, { signal });
    }
}