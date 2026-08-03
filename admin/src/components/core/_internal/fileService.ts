import { API_URL, STORAGE_URL, TOKEN_KEY } from 'config/env';

const defaultSuccess = 'Operacion realizada correctamente';
const defaultError = 'No se pudo completar la operacion';

export type BaseResponse<Model = unknown> = {
    success: boolean;
    msg: string;
    data?: Model;
    rows?: Model[];
    count?: number;
};

export type UploadResponseModel = {
    fileName?: string;
    filePath?: string;
};

const getHeaders = (): Record<string, string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const sendSuccess = <Model>(response: Partial<BaseResponse<Model>> = {}): BaseResponse<Model> => ({
    success: true,
    msg: response.msg || defaultSuccess,
    data: response.data,
    rows: response.rows,
    count: response.count
});

const sendError = <Model>(response: Partial<BaseResponse<Model>> = {}): BaseResponse<Model> => ({
    success: false,
    msg: response.msg || defaultError,
    data: response.data,
    rows: response.rows,
    count: response.count
});

const uploadFile = async (file: File, fileName = file.name, onProgress?: (progress: number, uploaded: boolean) => void): Promise<BaseResponse<UploadResponseModel>> => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file, fileName);

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable || !onProgress) return;
            onProgress(Math.round((event.loaded / event.total) * 100), false);
        };

        xhr.onload = () => {
            if (onProgress) onProgress(100, true);

            try {
                const payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                resolve(xhr.status >= 200 && xhr.status < 300 ? sendSuccess<UploadResponseModel>({ data: payload }) : sendError<UploadResponseModel>({ msg: payload.error || payload.message || defaultError }));
            } catch {
                resolve(sendError<UploadResponseModel>());
            }
        };

        xhr.onerror = () => resolve(sendError<UploadResponseModel>());
        xhr.open('POST', `${API_URL}/storage/upload`);
        Object.entries(getHeaders()).forEach(([key, value]) => xhr.setRequestHeader(key, value));
        xhr.send(formData);
    });
};

const removeFile = async (fileName: string): Promise<BaseResponse> => {
    try {
        const response = await fetch(`${API_URL}/storage/upload`, {
            method: 'DELETE',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...getHeaders() },
            body: JSON.stringify({ fileName })
        });
        if (!response.ok) return sendError();
        return sendSuccess();
    } catch {
        return sendError();
    }
};

const buildPublicURL = (fileName: string): string => (fileName.startsWith('http') ? fileName : `${STORAGE_URL}/${encodeURIComponent(fileName)}`);

export const fileService = {
    uploadFile,
    removeFile,
    buildPublicURL,
    sendSuccess,
    sendError
};
