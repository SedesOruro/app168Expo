export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type ApiFilterValue = string | number | boolean;

export type ApiFilters = {
  [key: string]: ApiFilterValue | ApiFilterValue[];
};

export type QueryParams = {
  rowsPerPage?: number;
  page?: number;
  searchText?: string;
  order?: "asc" | "desc";
  orderBy?: string;
  filters?: ApiFilters;
};

export type ApiResponse<Model> = {
  success: boolean;
  msg: string;
  data?: Model;
  rows?: Model[];
  count?: number;
};

export type UploadResponseModel = {
  msg: string;
  file: string;
  name: string;
  path: string;
};

export type BaseResponse<Model> = ApiResponse<Model>;
export type RequestMethod = HttpMethod;
export type RequestFilters = ApiFilters;

