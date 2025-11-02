// Backend response format có thể dùng cả 'success' và 'isSuccess'
export interface ServiceResponse<T> {
  data: T | { data?: T; count?: number }; // Có thể nested: { data: { data: T } }
  message?: string;
  isSuccess?: boolean; // Format cũ
  success?: boolean; // Format mới từ backend
  statusCode?: number;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

