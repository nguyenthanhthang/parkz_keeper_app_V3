// API Configuration
// ============================================
// PRODUCTION BACKEND (Deployed) ✅
// ============================================
// Backend đã được deploy tại: http://103.56.161.75
// Swagger UI: http://103.56.161.75/swagger/index.html
// API Base URL: http://103.56.161.75/api
// ============================================
export const API_BASE_URL = "http://103.56.161.75/api";

// Dev logging toggle for API requests/responses
export const ENABLE_API_LOGS =
  (process.env.EXPO_PUBLIC_API_LOGS as string) === '1' || false;

// Google Maps Configuration
// ============================================
// Google Maps API Key - Cần cấu hình từ Google Cloud Console
// Hướng dẫn: https://console.cloud.google.com/
// 1. Enable "Maps JavaScript API"
// 2. Tạo API Key
// 3. Copy API Key vào đây
// ============================================
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "user_data",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: "/admin-authentication", // Admin login
  MANAGER_LOGIN: "/business-manager-authentication", // Manager login
  KEEPER_LOGIN: "/staff-authentication", // Keeper login ✅ Fixed
  CUSTOMER_LOGIN: "/mobile/customer-authentication/login", // Customer login

  // Booking
  CREATE_PASSERBY_BOOKING: "/booking-management-for-keeper/create/passerby",
  SEARCH_BOOKING: "/booking-management-for-keeper/keeper",
  GET_ALL_BOOKINGS: "/booking-management-for-keeper",
  FILTER_BOOKINGS: "/booking-management-for-keeper/filters",
  GET_BOOKING_INFO: "/keeper/booking-Infomation",

  // Slot
  GET_AVAILABLE_SLOTS: "/keeper/parking-slot/floors/floor/parking-slots",
  GET_AVAILABLE_SLOTS_PASSERBY:
    "/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby",
  CHANGE_SLOT: "/keeper/parking-slot/change",
  CHANGE_SLOT_COME_EARLY: "/keeper/parking-slot/change/come-early",
  DISABLE_SLOT: "/keeper/parking-slot/disable",
  ENABLE_SLOT: "/keeper/parking-slot/enable",

  // Conflict
  GET_CONFLICT_REQUESTS: "/conflict-request/keeper",

  // Profile
  GET_KEEPER_INFO: "/keeper-account-management",

  // Manager - Parking Management
  GET_ALL_PARKINGS: "/parkings",
  GET_PARKING_BY_ID: "/parkings",
  GET_PARKING_DETAIL: "/parkings/parking",
  CREATE_PARKING: "/parkings/parking",
  UPDATE_PARKING: "/parkings/parking",
  UPDATE_PARKING_LOCATION: "/parkings/parking/location",
  DELETE_PARKING: "/parkings/parking",
  MARK_PARKING_FULL: "/parkings/parking/full",
  GET_PARKINGS_BY_PRICE: "/parkings/parking-price",
  DISABLE_PARKING_BY_DATE: "/parkings/disable-parking-by-date",
  DISABLE_PARKING_BY_DATETIME: "/parkings/disable-parking-by-date-time",
  ENABLE_DISABLE_PARKING_AT_DATE: "/parkings/enable-disable-parking-at-date",
  CANCEL_DISABLE_SCHEDULED: "/parkings/cancel-disable-scheduled-parking",
  GET_SCHEDULED_DISABLE_HISTORY: "/parkings/scheduled-history-disable-parking",
  GET_SUCCESSED_DISABLE_HISTORY: "/parkings/successed-history-disable-parking",

  // Manager - Floor Management
  GET_ALL_FLOORS: "/floors",
  GET_FLOORS_BY_PARKING: "/floors/parking",
  CREATE_FLOOR: "/floors/floor",
  UPDATE_FLOOR: "/floors/floor",
  DELETE_FLOOR: "/floors/floor",

  // Manager - Slot Management
  GET_SLOTS_BY_FLOOR: "/parkingSlot/floor",
  CREATE_SLOT: "/parkingSlot/create",
  UPDATE_SLOT: "/parkingSlot",

  // Manager - Pricing Management
  GET_PARKING_PRICES: "/parking-price",
  CREATE_PARKING_PRICE: "/parking-price/create",
  DISABLE_ENABLE_PARKING_PRICE:
    "/parking-price/disable-or-enable-parking-price",

  // Manager - Timeline Management
  GET_TIMELINES: "/timeline-management",
  CREATE_TIMELINE: "/timeline-management",
  UPDATE_TIMELINE: "/timeline-management",
  DELETE_TIMELINE: "/timeline-management",

  // Manager - Parking Has Price
  GET_PARKING_HAS_PRICE_LIST: "/parkingHasPrice/getlistparkinghasprice",
  GET_PARKING_HAS_PRICE_DETAIL: "/parkingHasPrice/detail",
  CREATE_PARKING_HAS_PRICE: "/parkingHasPrice",
  UPDATE_PARKING_HAS_PRICE: "/parkingHasPrice",
  DELETE_PARKING_HAS_PRICE: "/parkingHasPrice",
  DELETE_PARKING_HAS_PRICE_V2: "/parkingHasPrice/v2",

  // Manager - Booking Management
  GET_MANAGER_BOOKINGS: "/booking-management/request",
  GET_MANAGER_BOOKING_DETAIL: "/booking-management",
  APPROVE_BOOKING: "/booking-management/approve-booking",
  CHECKOUT_BOOKING: "/booking-management/check-out",
  MARK_BOOKING_DONE: "/booking-management/done",
  GET_BOOKINGS_BY_PARKING: "/booking-management/parkings",

  // Manager - Keeper Management
  GET_KEEPER_ACCOUNTS: "/keeper-account-management",
  CREATE_KEEPER: "/keeper-account-management/register",
  DELETE_KEEPER: "/keeper-account-management",
  GET_KEEPER_MANAGEMENT: "/keeper-management/manager",

  // Manager - Business Profile
  CREATE_BUSINESS_PROFILE: "/business-profile",
  GET_BUSINESS_PROFILE_BY_USER: "/user",
  GET_BUSINESS_PROFILE_BY_MANAGER: "/business-profile/business-profile",

  // Manager - Parking Spot Image
  GET_PARKING_IMAGES: "/parking-spot-image",
  CREATE_PARKING_IMAGE: "/parking-spot-image",
  UPDATE_PARKING_IMAGE: "/parking-spot-image",
  DELETE_PARKING_IMAGE: "/parking-spot-image",

  // Manager - Statistics & Charts
  GET_PIE_DONE_CANCEL_BOOKING: "/chart/pie/done-cancel-booking",
  GET_PIE_PARKING_DONE_CANCEL: "/chart/pie/parkings",
  GET_LINE_REVENUE: "/chart/line/month-or-week-revenue",
  GET_LINE_PARKING_REVENUE: "/chart/line/parkings",
  GET_STATISTIC_CARD: "/chart/card/statistic-card",
  GET_PARKING_STATISTIC_CARD: "/chart/card/parkings",

  // Account Management
  CHANGE_PASSWORD: "/my-manager-account",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NO = 1;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;
