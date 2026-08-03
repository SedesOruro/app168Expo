import { API_URL, STORAGE_URL, TOKEN_KEY } from "../../config/env";
import { ApiFilters, ApiResponse, HttpMethod, QueryParams, UploadResponseModel } from "../../types/api";

const defaultSuccess = "Operacion realizada correctamente";
const defaultError = "No se pudo completar la operacion";

const getHeaders = (json = true): HeadersInit => {
  const headers: Record<string, string> = json ? { Accept: "application/json", "Content-Type": "application/json" } : {};
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const buildQueryFilters = (filters: ApiFilters): string[] =>
  Object.keys(filters)
    .filter((key) => !["_limit", "_page", "_sort", "_order", "q"].includes(key))
    .flatMap((key) => {
      const value = filters[key];
      return Array.isArray(value) ? value.map((item) => `${key}=${encodeURIComponent(item)}`) : `${key}=${encodeURIComponent(value)}`;
    });

const buildQueryParamsText = (queryParams: QueryParams = {}): string => {
  const params = queryParams.filters ? buildQueryFilters(queryParams.filters) : [];
  if (queryParams.rowsPerPage) params.push(`_limit=${queryParams.rowsPerPage}`);
  if (queryParams.page) params.push(`_page=${queryParams.page}`);
  if (queryParams.searchText) params.push(`q=${encodeURIComponent(queryParams.searchText)}`);
  if (queryParams.orderBy) params.push(`_sort=${queryParams.orderBy}`);
  if (queryParams.order) params.push(`_order=${queryParams.order}`);
  return params.length ? `?${params.join("&")}` : "";
};

const validateResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return {};
  const json = await response.json().catch(() => ({}));
  if (response.ok) return json;
  if (response.status === 401) window.dispatchEvent(new Event("auth:unauthorized"));
  throw new Error(json.error || json.message || defaultError);
};

const sendSuccess = <Model>(response: Partial<ApiResponse<Model>> = {}): ApiResponse<Model> => ({
  success: true,
  msg: response.msg || defaultSuccess,
  data: response.data,
  rows: response.rows,
  count: response.count
});

const sendError = <Model>(response: Partial<ApiResponse<Model>> = {}): ApiResponse<Model> => ({
  success: false,
  msg: response.msg || defaultError,
  data: response.data,
  rows: response.rows,
  count: response.count
});

const request = async <Model>(method: HttpMethod, routePath: string, data?: unknown): Promise<ApiResponse<Model>> => {
  try {
    const response = await fetch(`${API_URL}${routePath}`, {
      method: method.toUpperCase(),
      headers: getHeaders(!(data instanceof FormData)),
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
    const payload = (await validateResponse(response)) as Model;
    return { success: true, msg: defaultSuccess, data: payload };
  } catch (error) {
    return { success: false, msg: error instanceof Error ? error.message : defaultError };
  }
};

const findAll = async <Model>(routePath: string, queryParams: QueryParams = {}): Promise<ApiResponse<Model>> => {
  const response = await request<{ rows: Model[]; count: number }>("get", `${routePath}${buildQueryParamsText(queryParams)}`);
  return {
    success: response.success,
    msg: response.msg,
    rows: response.data?.rows || [],
    count: response.data?.count || 0
  };
};

const uploadFile = async (file: File, fileName = file.name, onProgress?: (progress: number, uploaded: boolean) => void): Promise<ApiResponse<UploadResponseModel>> => {
  if (!onProgress) {
    const formData = new FormData();
    formData.append("file", file, fileName);
    return request<UploadResponseModel>("post", "/storage/upload", formData);
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file, fileName);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100), false);
    };

    xhr.onload = () => {
      onProgress(100, true);
      try {
        const payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        if (xhr.status >= 200 && xhr.status < 300) resolve(sendSuccess<UploadResponseModel>({ data: payload }));
        else resolve(sendError<UploadResponseModel>({ msg: payload.error || payload.message || defaultError }));
      } catch {
        resolve(sendError<UploadResponseModel>());
      }
    };

    xhr.onerror = () => resolve(sendError<UploadResponseModel>());
    xhr.open("POST", `${API_URL}/storage/upload`);
    const headers = getHeaders(false) as Record<string, string>;
    Object.keys(headers).forEach((key) => xhr.setRequestHeader(key, headers[key]));
    xhr.send(formData);
  });
};

const removeFile = async (fileName: string): Promise<ApiResponse<unknown>> => {
  return request("delete", "/storage/upload", { fileName });
};

const buildPublicURL = (fileName: string): string => {
  return fileName.startsWith("http") ? fileName : `${STORAGE_URL}/${encodeURIComponent(fileName)}`;
};

export const BaseService = {
  request,
  findAll,
  buildQueryParamsText,
  uploadFile,
  removeFile,
  buildPublicURL,
  sendSuccess,
  sendError
};
