import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  BusinessProfile,
  CreateBusinessProfileRequest,
  UpdateBusinessProfileRequest,
} from '../../../types';

export const businessProfileApi = {
  /**
   * Tạo business profile mới
   * Endpoint: POST /api/business-profile
   */
  async createBusinessProfile(
    data: CreateBusinessProfileRequest
  ): Promise<BusinessProfile> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CREATE_BUSINESS_PROFILE,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || '';

    if (isSuccess && response?.data) {
      const profileData = response.data?.data || response.data;
      return profileData as BusinessProfile;
    }

    throw new Error(message || 'Failed to create business profile');
  },

  /**
   * Lấy business profile theo UserId
   * Endpoint: GET /api/user/{userId}/business-profile
   */
  async getBusinessProfileByUser(userId: number): Promise<BusinessProfile | null> {
    try {
      const response: any = await apiClient.get(
        `${API_ENDPOINTS.GET_BUSINESS_PROFILE_BY_USER}/${userId}/business-profile`
      );

      const isSuccess = response?.success || response?.isSuccess;

      if (isSuccess && response?.data) {
        const profileData = response.data?.data || response.data;
        return profileData as BusinessProfile;
      }

      // Nếu không có data, return null (chưa có profile)
      return null;
    } catch (error: any) {
      // Nếu 404 hoặc không tìm thấy, return null thay vì throw error
      if (error?.response?.status === 404 || error?.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Lấy business profile theo ManagerId
   * Endpoint: GET /api/business-profile/business-profile/{managerId}
   * Hoặc có thể là: GET /api/user/{userId}/business-profile
   */
  async getBusinessProfileByManager(
    managerId: number
  ): Promise<BusinessProfile | null> {
    try {
      console.log('API: Getting business profile for managerId:', managerId);
      
      // Thử endpoint theo managerId trước
      // Format: /api/business-profile/business-profile/{managerId}
      const endpoint1 = `${API_ENDPOINTS.GET_BUSINESS_PROFILE_BY_MANAGER}/${managerId}`;
      console.log('API: Trying endpoint 1 (managerId):', endpoint1);
      console.log('API: Full URL will be:', `http://103.56.161.75/api${endpoint1}`);
      
      try {
        const response: any = await apiClient.get(endpoint1);
        console.log('API: Response from endpoint 1:', JSON.stringify(response, null, 2));

        const isSuccess = response?.success || response?.isSuccess;

        if (isSuccess && response?.data) {
          const profileData = response.data?.data || response.data;
          console.log('API: Profile data:', profileData);
          
          // Map API response format to BusinessProfile interface
          if (profileData && typeof profileData === 'object') {
            // Tạo object với format đúng
            const mappedProfile: BusinessProfile = {
              businessProfileId: profileData.businessProfileId,
              businessProfileName: profileData.businessProfileName,
              businessName: profileData.businessProfileName, // Alias
              address: profileData.address,
              businessLicense: profileData.businessLicense,
              frontIdentification: profileData.frontIdentification,
              backIdentification: profileData.backIdentification,
              userId: profileData.userId,
              name: profileData.name,
              phone: profileData.phone,
              email: profileData.email,
              avatar: profileData.avatar,
              dateOfBirth: profileData.dateOfBirth,
              gender: profileData.gender,
              roleName: profileData.roleName,
              type: profileData.type,
              // Legacy fields
              id: profileData.businessProfileId,
            };
            return mappedProfile;
          }
          
          // Nếu data là array, lấy phần tử đầu tiên
          if (Array.isArray(profileData) && profileData.length > 0) {
            const firstItem = profileData[0];
            return {
              businessProfileId: firstItem.businessProfileId,
              businessProfileName: firstItem.businessProfileName,
              businessName: firstItem.businessProfileName,
              address: firstItem.address,
              businessLicense: firstItem.businessLicense,
              frontIdentification: firstItem.frontIdentification,
              backIdentification: firstItem.backIdentification,
              userId: firstItem.userId,
              name: firstItem.name,
              phone: firstItem.phone,
              email: firstItem.email,
              avatar: firstItem.avatar,
              dateOfBirth: firstItem.dateOfBirth,
              gender: firstItem.gender,
              roleName: firstItem.roleName,
              type: firstItem.type,
              id: firstItem.businessProfileId,
            } as BusinessProfile;
          }
          
          return profileData as BusinessProfile;
        }
      } catch (err1: any) {
        console.log('API: Endpoint 1 failed:', err1?.response?.status);
        
          // Nếu 404, thử endpoint theo userId
          if (err1?.response?.status === 404) {
            console.log('API: Endpoint 1 returned 404, trying endpoint 2 with userId:', managerId);
            // Format: /api/user/{userId}/business-profile
            const endpoint2 = `${API_ENDPOINTS.GET_BUSINESS_PROFILE_BY_USER}/${managerId}/business-profile`;
            console.log('API: Trying endpoint 2 (userId):', endpoint2);
            console.log('API: Full URL will be:', `http://103.56.161.75/api${endpoint2}`);
          
          try {
            const response2: any = await apiClient.get(endpoint2);
            console.log('API: Response from endpoint 2:', JSON.stringify(response2, null, 2));

            const isSuccess2 = response2?.success || response2?.isSuccess;

            if (isSuccess2 && response2?.data) {
              const profileData = response2.data?.data || response2.data;
              console.log('API: Profile data from endpoint 2:', profileData);
              
              // Map API response format (tương tự endpoint 1)
              if (profileData && typeof profileData === 'object') {
                return {
                  businessProfileId: profileData.businessProfileId,
                  businessProfileName: profileData.businessProfileName,
                  businessName: profileData.businessProfileName,
                  address: profileData.address,
                  businessLicense: profileData.businessLicense,
                  frontIdentification: profileData.frontIdentification,
                  backIdentification: profileData.backIdentification,
                  userId: profileData.userId,
                  name: profileData.name,
                  phone: profileData.phone,
                  email: profileData.email,
                  avatar: profileData.avatar,
                  dateOfBirth: profileData.dateOfBirth,
                  gender: profileData.gender,
                  roleName: profileData.roleName,
                  type: profileData.type,
                  id: profileData.businessProfileId,
                } as BusinessProfile;
              }
              
              if (Array.isArray(profileData) && profileData.length > 0) {
                const firstItem = profileData[0];
                return {
                  businessProfileId: firstItem.businessProfileId,
                  businessProfileName: firstItem.businessProfileName,
                  businessName: firstItem.businessProfileName,
                  address: firstItem.address,
                  businessLicense: firstItem.businessLicense,
                  frontIdentification: firstItem.frontIdentification,
                  backIdentification: firstItem.backIdentification,
                  userId: firstItem.userId,
                  name: firstItem.name,
                  phone: firstItem.phone,
                  email: firstItem.email,
                  avatar: firstItem.avatar,
                  dateOfBirth: firstItem.dateOfBirth,
                  gender: firstItem.gender,
                  roleName: firstItem.roleName,
                  type: firstItem.type,
                  id: firstItem.businessProfileId,
                } as BusinessProfile;
              }
              
              return profileData as BusinessProfile;
            }
          } catch (err2: any) {
            console.log('API: Endpoint 2 also failed:', err2?.response?.status);
            // Nếu cả 2 đều 404, return null
            if (err2?.response?.status === 404) {
              console.log('API: Profile not found (404 from both endpoints)');
              return null;
            }
            throw err2;
          }
        } else {
          throw err1;
        }
      }

      // Nếu không có data, return null (chưa có profile)
      console.log('API: No profile data found');
      return null;
    } catch (error: any) {
      console.error('API: Error getting business profile:', error);
      console.error('API: Error response:', error?.response);
      // Nếu 404 hoặc không tìm thấy, return null thay vì throw error
      if (error?.response?.status === 404 || error?.message?.includes('not found')) {
        console.log('API: Profile not found (404)');
        return null;
      }
      throw error;
    }
  },
};

