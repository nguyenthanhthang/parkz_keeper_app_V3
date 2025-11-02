export interface BusinessProfile {
  // Response từ API có format khác
  businessProfileId?: number; // ID của business profile
  businessProfileName?: string; // Tên doanh nghiệp (từ API)
  businessName?: string; // Tên doanh nghiệp (alias cho businessProfileName)
  address?: string; // Địa chỉ
  businessLicense?: string; // Giấy phép kinh doanh
  frontIdentification?: string; // URL mặt trước CMND/CCCD
  backIdentification?: string; // URL mặt sau CMND/CCCD
  
  // User info (từ API response)
  userId?: number;
  name?: string; // Tên người dùng
  phone?: string; // Số điện thoại
  email?: string; // Email
  avatar?: string; // URL avatar
  dateOfBirth?: string; // Ngày sinh
  gender?: string; // Giới tính
  roleName?: string; // Tên vai trò
  
  // Legacy fields (nếu cần)
  id?: number; // Alias cho businessProfileId
  taxCode?: string; // Mã số thuế
  description?: string; // Mô tả
  website?: string; // Website
  managerId?: number; // ID Manager
  type?: string | null; // Loại business
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBusinessProfileRequest {
  businessName: string; // Required - Tên doanh nghiệp
  taxCode?: string; // Mã số thuế
  address?: string; // Địa chỉ
  phone?: string; // Số điện thoại
  email?: string; // Email
  description?: string; // Mô tả
  website?: string; // Website
  managerId: number; // Required - ID Manager
}

export interface UpdateBusinessProfileRequest {
  businessName?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  website?: string;
}

