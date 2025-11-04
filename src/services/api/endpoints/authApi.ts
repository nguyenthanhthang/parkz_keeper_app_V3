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

    try {
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
            // Parse parkingId (có thể là string hoặc number trong JWT)
            const parkingId = payload.parkingId 
              ? (typeof payload.parkingId === 'string' ? parseInt(payload.parkingId, 10) : payload.parkingId)
              : undefined;
            
            user = {
              id: parseInt(payload._id || payload.id || '0', 10),
              email: credentials.email,
              name: payload.name || response.message?.replace('Chào mừng ', '') || 'Manager',
              role: payload.role || UserRole.MANAGER,
              phone: payload.phone,
              parkingId: parkingId,
              parkingName: payload.parkingName,
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
    } catch (error: any) {
      // Handle specific error messages
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      // Check for parking not found error (for Keeper)
      if (errorMessage.includes('Không tìm thấy bãi') || errorMessage.includes('Không tìm thấy parking')) {
        throw new Error('Tài khoản chưa được gán bãi đỗ hoặc bãi đỗ chưa được kích hoạt. Vui lòng liên hệ admin để được hỗ trợ.');
      }
      
      // Check for business profile or subscription errors (for Manager)
      if (errorMessage.includes('chưa áp dụng gói') || errorMessage.includes('chưa áp dụng package')) {
        throw new Error('Doanh nghiệp chưa áp dụng gói. Vui lòng liên hệ admin để đăng ký gói dịch vụ.');
      }
      
      // Re-throw original error if no specific handling
      throw error;
    }
  },

  /**
   * Login for Keeper
   * Endpoint: POST /api/business-manager-authentication (dùng chung với Manager)
   * Request body: { Email: string, Password: string }
   * Response format tương tự Manager: { success: true, data: { data: { token } }, message: "..." }
   */
  async loginKeeper(credentials: LoginCredentials): Promise<LoginResponse> {
    // Keeper dùng chung endpoint với Manager, format Email/Password (PascalCase)
    const request: ManagerLoginRequest = {
      Email: credentials.email,
      Password: credentials.password,
    };

    try {
      const response: any = await apiClient.post(
        API_ENDPOINTS.MANAGER_LOGIN, // Dùng chung endpoint với Manager
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
            // Parse parkingId (có thể là string hoặc number trong JWT)
            const parkingId = payload.parkingId 
              ? (typeof payload.parkingId === 'string' ? parseInt(payload.parkingId, 10) : payload.parkingId)
              : undefined;
            
            user = {
              id: parseInt(payload._id || payload.id || '0', 10),
              email: credentials.email,
              name: payload.name || 'Keeper',
              role: payload.role || UserRole.KEEPER,
              phone: payload.phone,
              parkingId: parkingId,
              parkingName: payload.parkingName,
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
    } catch (error: any) {
      // Handle specific error messages
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      // Check for parking not found error (Keeper needs parking to be available)
      if (errorMessage.includes('Không tìm thấy bãi') || errorMessage.includes('Không tìm thấy parking')) {
        throw new Error('Keeper chưa được gán bãi đỗ hoặc bãi đỗ chưa được kích hoạt. Vui lòng liên hệ admin để được hỗ trợ.');
      }
      
      // Check for inactive or not censored keeper
      if (errorMessage.includes('chưa được duyệt') || errorMessage.includes('chưa kích hoạt')) {
        throw new Error('Tài khoản Keeper chưa được duyệt hoặc chưa được kích hoạt. Vui lòng liên hệ admin.');
      }
      
      // Re-throw original error if no specific handling
      throw error;
    }
  },

  /**
   * Universal login - automatically detects role or uses specified role
   * Note: Both Manager and Keeper use the same endpoint (/api/business-manager-authentication)
   * The role is determined from the JWT token payload
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Cả Manager và Keeper đều dùng chung endpoint
    // Backend sẽ xác định role từ credentials và trả về token với role tương ứng
    return this.loginManager(credentials); // Dùng chung logic với Manager
  },

  /**
   * Get current keeper information
   * Endpoint: GET /api/keeper-account-management/{userId}
   * Response structure: { data: { count: 0, data: { userId, parkingId, parkingName, ... }, success: true } }
   * 
   * Unwrap và map key để trả về User type đã chuẩn hóa
   */
  async getKeeperInfo(userId: number): Promise<User> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.GET_KEEPER_INFO}/${userId}`
    );
    
    // ✅ Unwrap an toàn theo shape thực tế: response.data.data hoặc response.data
    const responseData = response?.data;
    const payload = responseData?.data ?? responseData ?? response ?? {};
    
    // Kiểm tra success
    const isSuccess = responseData?.success || responseData?.isSuccess || response?.isSuccess;
    
    if (!isSuccess && !payload.userId && !payload.parkingId) {
      throw new Error(responseData?.message || response?.message || 'Failed to get keeper info');
    }
    
    // ✅ Map key về shape của app (userId→id, roleName→role)
    // API trả về: { userId, roleName, parkingId, parkingName, name, email, phone, ... }
    // User type cần: { id, role, parkingId, parkingName, name, email, phone }
    const user: User = {
      id: payload.userId ?? payload.id ?? userId,
      name: payload.name ?? '',
      email: payload.email ?? '',
      phone: payload.phone,
      role: payload.roleName ?? payload.role ?? UserRole.KEEPER,
      parkingId: payload.parkingId,
      parkingName: payload.parkingName,
    };
    
    return user;
  },

  /**
   * Logout (client-side only - clear token)
   */
  async logout(): Promise<void> {
    // Token removal is handled by storage utility
    // This function is here for consistency and future API calls if needed
  },
};

