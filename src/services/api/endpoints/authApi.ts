import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import { decodeJWT } from '../../../utils/jwt';
import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  ServiceResponse, 
  UserRole,
  ManagerLoginRequest 
} from '../../../types';

export const authApi = {
  /**
   * Login for Manager
   * Endpoint: POST /api/business-manager-authentication
   * Response format: { success: true, data: { data: { token: "..." } }, message: "...", statusCode: 200 }
   */
  async loginManager(credentials: LoginCredentials): Promise<LoginResponse> {
    const request: ManagerLoginRequest = {
      Email: credentials.email,
      Password: credentials.password,
    };

    const response: any = await apiClient.post(
      API_ENDPOINTS.MANAGER_LOGIN,
      request
    );
    
    // Handle backend response format: { success, data: { data: { token } }, message, statusCode }
    const isSuccess = response?.success || response?.isSuccess;
    
    if (isSuccess && response?.data) {
      // Extract token - có thể ở response.data.data.token hoặc response.data.token
      const tokenData = response.data?.data || response.data;
      const token = tokenData?.token;
      
      if (!token) {
        throw new Error('Token not found in response');
      }

      // Extract user info từ token JWT payload
      // Decode JWT token để lấy thông tin user (không cần verify, chỉ decode)
      let user: User;
      
      if (tokenData?.user) {
        user = tokenData.user;
      } else if (response.user) {
        user = response.user;
      } else {
        // Decode JWT token để lấy thông tin từ payload
        const payload = decodeJWT(token);
        
        if (payload) {
          user = {
            id: parseInt(payload._id || payload.id || '0', 10),
            email: credentials.email,
            name: payload.name || response.message?.replace('Chào mừng ', '') || 'Manager',
            role: payload.role || UserRole.MANAGER,
            phone: payload.phone,
          };
        } else {
          // Fallback: tạo user từ credentials và response message
          user = {
            id: 0,
            email: credentials.email,
            name: response.message?.replace('Chào mừng ', '') || 'Manager',
            role: UserRole.MANAGER,
          };
        }
      }

      return {
        token,
        user,
      };
    }
    
    throw new Error(response?.message || 'Manager login failed');
  },

  /**
   * Login for Keeper
   * Endpoint: POST /api/staff-authentication
   * Request body: { username: string, password: string }
   * Response format tương tự Manager: { success: true, data: { data: { token } }, message: "..." }
   */
  async loginKeeper(credentials: LoginCredentials): Promise<LoginResponse> {
    // Keeper API uses username/password format
    const request = {
      username: credentials.email, // email field used as username
      password: credentials.password,
    };

    const response: any = await apiClient.post(
      API_ENDPOINTS.KEEPER_LOGIN,
      request
    );
    
    // Handle backend response format tương tự Manager
    const isSuccess = response?.success || response?.isSuccess;
    
    if (isSuccess && response?.data) {
      // Extract token
      const tokenData = response.data?.data || response.data;
      const token = tokenData?.token;
      
      if (!token) {
        throw new Error('Token not found in response');
      }

      // Extract user info từ token hoặc response
      let user: User;
      
      if (tokenData?.user) {
        user = tokenData.user;
      } else if (response.user) {
        user = response.user;
      } else {
        // Decode JWT token để lấy thông tin từ payload
        const payload = decodeJWT(token);
        
        if (payload) {
          user = {
            id: parseInt(payload._id || payload.id || '0', 10),
            email: credentials.email,
            name: payload.name || 'Keeper',
            role: payload.role || UserRole.KEEPER,
            phone: payload.phone,
          };
        } else {
          // Fallback
          user = {
            id: 0,
            email: credentials.email,
            name: 'Keeper',
            role: UserRole.KEEPER,
          };
        }
      }

      return {
        token,
        user,
      };
    }
    
    throw new Error(response?.message || 'Keeper login failed');
  },

  /**
   * Universal login - automatically detects role or uses specified role
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // If role is specified, use appropriate endpoint
    if (credentials.role === UserRole.MANAGER) {
      return this.loginManager(credentials);
    } else if (credentials.role === UserRole.KEEPER) {
      return this.loginKeeper(credentials);
    }

    // Try Keeper login first (current implementation)
    try {
      return await this.loginKeeper(credentials);
    } catch (error) {
      // If fails, try Manager login
      return this.loginManager(credentials);
    }
  },

  /**
   * Get current keeper information
   */
  async getKeeperInfo(userId: number): Promise<User> {
    const response = await apiClient.get<ServiceResponse<User>>(
      `${API_ENDPOINTS.GET_KEEPER_INFO}/${userId}`
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to get keeper info');
  },

  /**
   * Logout (client-side only - clear token)
   */
  async logout(): Promise<void> {
    // Token removal is handled by storage utility
    // This function is here for consistency and future API calls if needed
  },
};

