import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { API_BASE_URL, ENABLE_API_LOGS } from "../../utils/constants";
import { tokenStorage } from "../../utils/storage";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Increased timeout for local development
      headers: {
        "Content-Type": "application/json",
        // Skip Ngrok browser warning page (nếu dùng Ngrok)
        "ngrok-skip-browser-warning": "true",
      },
      // For HTTPS with self-signed certificates in development
      ...(__DEV__ && {
        httpsAgent: undefined, // Let React Native handle certificates
      }),
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add token to headers
    this.client.interceptors.request.use(
      async (config) => {
        const token = await tokenStorage.getToken();
        
        // DEV ONLY: Skip API calls when using mock token
        if (__DEV__ && token === 'mock_token_dev_only') {
          // Return a rejected promise to bypass the actual API call
          // Individual API functions will handle this and return mock data
          return config;
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development (toggle-able)
        if (__DEV__ && ENABLE_API_LOGS) {
          const fullUrl =
            config.url +
            (config.params
              ? "?" + new URLSearchParams(config.params).toString()
              : "");
          console.log("API Request:", {
            method: config.method?.toUpperCase(),
            url: fullUrl,
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development (toggle-able)
        if (__DEV__ && ENABLE_API_LOGS) {
          console.log("API Response:", {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          await tokenStorage.removeToken();
          // TODO: Dispatch logout action or navigate to login
          console.log("Unauthorized - Token expired");
        }

        // Log error in development with more details (toggle-able)
        if (__DEV__ && ENABLE_API_LOGS) {
          console.error("API Error:", {
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            message: error.message,
            code: error.code,
            data: error.response?.data,
          });

          // Special handling for timeout/connection errors
          if (
            error.code === "ECONNABORTED" ||
            error.message.includes("timeout")
          ) {
            console.error("⚠️ Timeout/Connection Error - Check:");
            console.error("  1. Backend đang chạy?");
            console.error("  2. Backend có bind với 0.0.0.0 không?");
            console.error("  3. Firewall có chặn không?");
            console.error("  4. IP address đúng? Current:", API_BASE_URL);
          }

          if (
            error.code === "ECONNREFUSED" ||
            error.message.includes("connect")
          ) {
            console.error(
              "⚠️ Connection Refused - Backend không accessible từ network"
            );
            console.error(
              "  Solution: Backend cần bind với 0.0.0.0:7071 thay vì localhost"
            );
          }
        }

        // Format error message
        const errorMessage = this.getErrorMessage(error);
        return Promise.reject({
          ...error,
          message: errorMessage,
        });
      }
    );
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;

      // Check for error message in response
      if (data.message) {
        return data.message;
      }

      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(", ");
      }

      if (typeof data === "string") {
        return data;
      }
    }

    if (error.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // POST request
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // PATCH request
  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
