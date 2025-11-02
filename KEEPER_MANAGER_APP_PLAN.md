npm# KẾ HOẠCH TRIỂN KHAI APP KEEPER-MANAGER

## 📋 MỤC LỤC

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Phân tích yêu cầu](#phân-tích-yêu-cầu)
3. [Kiến trúc ứng dụng](#kiến-trúc-ứng-dụng)
4. [Modules chức năng](#modules-chức-năng)
5. [Roadmap triển khai](#roadmap-triển-khai)
6. [Chi tiết từng phase](#chi-tiết-từng-phase)
7. [Công nghệ stack](#công-nghệ-stack)
8. [Checklist triển khai](#checklist-triển-khai)

---

## 📊 TỔNG QUAN DỰ ÁN

### Mục tiêu

Xây dựng ứng dụng mobile/web để quản lý bãi đỗ xe với 2 vai trò:

- **Manager**: Quản lý tổng thể bãi đỗ, nhân viên, thống kê
- **Keeper**: Quản lý booking và slot tại chỗ

### Phạm vi

- 50+ API endpoints cho Manager
- 12 API endpoints chính cho Keeper
- Authentication & Authorization
- Real-time updates (SignalR)
- Offline support (tùy chọn)

---

## 🎯 PHÂN TÍCH YÊU CẦU

### Manager Requirements

1. ✅ Quản lý bãi đỗ (CRUD)
2. ✅ Quản lý tầng và slot
3. ✅ Quản lý giá (bảng giá, timeline)
4. ✅ Quản lý booking (duyệt, check-out)
5. ✅ Quản lý keeper (tạo, xem, enable/disable)
6. ✅ Thống kê và báo cáo
7. ✅ Quản lý hình ảnh bãi đỗ
8. ✅ Business profile

### Keeper Requirements

1. ✅ Tạo booking cho passerby
2. ✅ Xem/tìm kiếm/lọc booking
3. ✅ Quản lý slot (đổi, vô hiệu hóa tạm thời)
4. ✅ Xử lý conflict request
5. ✅ Xem thông tin tài khoản

---

## 🏗️ KIẾN TRÚC ỨNG DỤNG

### Kiến trúc đề xuất: **Clean Architecture + MVVM/MVP**

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Manager UI  │  │   Keeper UI  │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Domain/Business Layer            │
│  - Use Cases                            │
│  - Models                               │
│  - Repositories Interface               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Layer                       │
│  - API Services                        │
│  - Local Storage                        │
│  - Cache                                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Infrastructure                   │
│  - Backend API                          │
│  - SignalR Hub                          │
└─────────────────────────────────────────┘
```

### Cấu trúc thư mục đề xuất:

```
app/
├── features/
│   ├── auth/
│   │   ├── login/
│   │   └── profile/
│   ├── manager/
│   │   ├── parking-management/
│   │   ├── floor-management/
│   │   ├── slot-management/
│   │   ├── pricing-management/
│   │   ├── booking-management/
│   │   ├── keeper-management/
│   │   ├── statistics/
│   │   └── business-profile/
│   ├── keeper/
│   │   ├── booking-management/
│   │   ├── slot-management/
│   │   ├── conflict-request/
│   │   └── dashboard/
│   └── shared/
│       ├── components/
│       ├── services/
│       ├── models/
│       └── utils/
├── core/
│   ├── api/
│   ├── storage/
│   ├── navigation/
│   └── theme/
└── main.dart / App.tsx
```

---

## 📦 MODULES CHỨC NĂNG

### 🔵 MODULE 1: Authentication & Profile

#### Chức năng:

- Đăng nhập (Manager/Keeper)
- Đổi mật khẩu
- Xem thông tin profile
- Logout

#### APIs sử dụng:

**Authentication:**

- `POST /api/business-manager-authentication` - Login (Manager/Keeper - cùng endpoint)
- `POST /api/business-manager-authentication/register` - Đăng ký Manager mới (Manager only)

**Account Management:**

- `GET /api/keeper-account-management/{userId}` - Thông tin profile (Manager, Keeper)
- `PUT /api/my-manager-account/{managerId}` - Đổi mật khẩu (Manager, Keeper)

#### Priority: **P0 (Critical)**

---

### 🟢 MODULE 2: Manager - Parking Management

#### Chức năng:

- Danh sách bãi đỗ
- Tạo bãi đỗ mới
- Cập nhật thông tin bãi đỗ
- Cập nhật vị trí (Map integration)
- Vô hiệu hóa/Kích hoạt bãi đỗ
- Đặt lịch vô hiệu hóa
- Xem lịch sử disable
- Đánh dấu bãi đỗ full

#### APIs sử dụng:

- `GET /api/parkings?managerId={id}&pageNo={pageNo}&pageSize={pageSize}` - Danh sách bãi đỗ
- `GET /api/parkings/{parkingId}` - Chi tiết bãi đỗ
- `GET /api/parkings/parking-price/{parkingPriceId}` - Bãi đỗ theo giá
- `POST /api/parkings/parking` - Tạo bãi đỗ mới
- `PUT /api/parkings/parking/{parkingId}` - Cập nhật thông tin bãi đỗ
- `PUT /api/parkings/parking/location/{parkingId}` - Cập nhật vị trí (lat/lng)
- `DELETE /api/parkings/parking/{parkingId}` - Vô hiệu hóa/Kích hoạt bãi đỗ
- `PUT /api/parkings/parking/full/{parkingId}` - Đánh dấu bãi đỗ full/empty
- `PUT /api/parkings/disable-parking-by-date` - Disable theo ngày
- `PUT /api/parkings/disable-parking-by-date-time` - Disable theo ngày và giờ
- `PUT /api/parkings/enable-disable-parking-at-date` - Enable/Disable theo ngày
- `DELETE /api/parkings/cancel-disable-scheduled-parking` - Hủy lịch disable đã lên lịch
- `GET /api/parkings/scheduled-history-disable-parking?parkingId={id}` - Lịch sử disable đã lên lịch
- `GET /api/parkings/successed-history-disable-parking?parkingId={id}` - Lịch sử disable đã thực hiện

#### Screens:

1. Parking List Screen
2. Parking Detail Screen
3. Create/Edit Parking Screen
4. Parking Map Screen
5. Disable Schedule Screen

#### Priority: **P0 (Critical)**

---

### 🟡 MODULE 3: Manager - Floor & Slot Management

#### Chức năng:

- Quản lý tầng (CRUD)
- Quản lý slot (CRUD)
- Xem slot theo tầng

#### APIs sử dụng:

- `GET /api/floors`
- `POST /api/floors/floor`
- `PUT /api/floors/floor/{floorId}`
- `DELETE /api/floors/floor/{floorId}`
- `GET /api/parkingSlot/floor/{floorId}`
- `POST /api/parkingSlot/create`
- `PUT /api/parkingSlot`

#### Screens:

1. Floor List Screen
2. Floor Detail Screen (với slot grid)
3. Create/Edit Floor Screen
4. Create/Edit Slot Screen

#### Priority: **P0 (Critical)**

---

### 🟠 MODULE 4: Manager - Pricing Management

#### Chức năng:

- Tạo và quản lý bảng giá
- Tạo timeline giá theo giờ
- Gán giá cho bãi đỗ
- Vô hiệu hóa/Kích hoạt giá

#### APIs sử dụng:

**Parking Price:**

- `GET /api/parking-price` - Danh sách bảng giá
- `POST /api/parking-price/create` - Tạo bảng giá mới
- `PUT /api/parking-price/disable-or-enable-parking-price` - Vô hiệu hóa/Kích hoạt giá

**Timeline Management:**

- `GET /api/timeline-management/{parkingPriceId}` - Danh sách timeline theo giá
- `POST /api/timeline-management` - Tạo timeline mới
- `PUT /api/timeline-management/{timelineId}` - Cập nhật timeline
- `DELETE /api/timeline-management/{timelineId}` - Vô hiệu hóa/Kích hoạt timeline

**Parking Has Price:**

- `GET /api/parkingHasPrice/getlistparkinghasprice` - Danh sách bãi đỗ có giá
- `GET /api/parkingHasPrice/detail/{id}` - Chi tiết bãi đỗ có giá
- `POST /api/parkingHasPrice` - Gán giá cho bãi đỗ
- `PUT /api/parkingHasPrice` - Cập nhật gán giá
- `DELETE /api/parkingHasPrice` - Xóa gán giá
- `DELETE /api/parkingHasPrice/v2/{parkingId}/{parkingPriceId}` - Xóa gán giá (v2)

#### Screens:

1. Pricing List Screen
2. Create/Edit Pricing Screen
3. Timeline Management Screen
4. Assign Price to Parking Screen

#### Priority: **P1 (High)**

---

### 🔴 MODULE 5: Manager - Booking Management

#### Chức năng:

- Danh sách booking
- Chi tiết booking
- Duyệt booking
- Check-out khách hàng
- Đánh dấu hoàn thành
- Xem booking theo bãi đỗ

#### APIs sử dụng:

- `GET /api/booking-management/request/{managerId}?pageNo={pageNo}&pageSize={pageSize}` - Danh sách booking theo Manager
- `GET /api/booking-management/{bookingId}` - Chi tiết booking
- `POST /api/booking-management/approve-booking` - Duyệt booking (SignalR: LoadHistoryInManager)
- `PUT /api/booking-management/check-out` - Check-out khách hàng (SignalR: LoadHistoryInManager)
- `PUT /api/booking-management/done` - Đánh dấu hoàn thành
- `GET /api/booking-management/parkings/{parkingId}?pageNo={pageNo}&pageSize={pageSize}` - Booking theo bãi đỗ

#### Screens:

1. Booking List Screen (với filter)
2. Booking Detail Screen
3. Approve Booking Screen

#### Priority: **P0 (Critical)**

---

### 🟣 MODULE 6: Manager - Keeper Management

#### Chức năng:

- Danh sách keeper
- Tạo tài khoản keeper mới
- Vô hiệu hóa/Kích hoạt keeper
- Xem thông tin chi tiết keeper

#### APIs sử dụng:

**Keeper Account Management:**

- `GET /api/keeper-account-management?pageNo={pageNo}&pageSize={pageSize}&managerId={managerId}` - Danh sách keeper
- `GET /api/keeper-account-management/{userId}` - Chi tiết keeper (Manager, Keeper)
- `POST /api/keeper-account-management/register` - Tạo tài khoản keeper (SignalR: LoadKeeperAccounts)
- `DELETE /api/keeper-account-management/{keeperId}` - Vô hiệu hóa/Kích hoạt keeper (SignalR: LoadKeeperAccounts)

**Keeper Management (Alternative):**

- `GET /api/keeper-management/manager?pageNo={pageNo}&pageSize={pageSize}&managerId={managerId}` - Danh sách keeper (alternative endpoint)

#### Screens:

1. Keeper List Screen
2. Create Keeper Screen
3. Keeper Detail Screen

#### Priority: **P1 (High)**

---

### 🔵 MODULE 7: Manager - Statistics & Reports

#### Chức năng:

- Thống kê booking (done/cancel)
- Doanh thu theo tuần/tháng
- Thống kê tổng quan
- Biểu đồ phân tích

#### APIs sử dụng:

**Thống kê tổng quan (theo Manager):**

- `GET /api/chart/pie/done-cancel-booking?managerId={managerId}` - Thống kê Done/Cancel (biểu đồ tròn)
- `GET /api/chart/line/month-or-week-revenue?managerId={managerId}&week={week}&month={month}` - Doanh thu tuần/tháng (biểu đồ đường)
- `GET /api/chart/card/statistic-card?managerId={managerId}` - Thống kê tổng quan (card)

**Thống kê theo bãi đỗ:**

- `GET /api/chart/pie/parkings/{parkingId}/done-cancel-booking` - Done/Cancel theo bãi đỗ
- `GET /api/chart/line/parkings/{parkingId}/month-or-week-revenue?week={week}&month={month}` - Doanh thu bãi đỗ
- `GET /api/chart/card/parkings/{parkingId}/statistic-card` - Thống kê tổng quan bãi đỗ

#### Screens:

1. Statistics Dashboard Screen
2. Revenue Chart Screen
3. Booking Statistics Screen

#### Priority: **P2 (Medium)**

---

### 🟢 MODULE 8: Manager - Business Profile

#### Chức năng:

- Tạo/Chỉnh sửa business profile
- Xem thông tin business

#### APIs sử dụng:

- `POST /api/business-profile` - Tạo business profile (SignalR: LoadBusinessProfileInAdmin)
- `GET /api/user/{userId}/business-profile` - Business profile theo UserId
- `GET /api/business-profile/business-profile/{managerId}` - Thông tin business theo ManagerId

#### Priority: **P2 (Medium)**

---

### 🟡 MODULE 9: Manager - Image Management

#### Chức năng:

- Thêm hình ảnh bãi đỗ
- Xóa hình ảnh
- Cập nhật hình ảnh
- Xem danh sách hình ảnh

#### APIs sử dụng:

- `GET /api/parking-spot-image/{parkingId}` - Danh sách hình ảnh bãi đỗ (Manager, Customer, Keeper, Admin)
- `POST /api/parking-spot-image` - Thêm hình ảnh bãi đỗ (Manager only)
- `PUT /api/parking-spot-image/{parkingSpotImageId}` - Cập nhật hình ảnh (Manager only)
- `DELETE /api/parking-spot-image/{parkingSpotImageId}` - Xóa hình ảnh (Manager only)

#### Priority: **P2 (Medium)**

---

### 🔴 MODULE 10: Keeper - Booking Management

#### Chức năng:

- Tạo booking cho passerby
- Danh sách booking
- Tìm kiếm booking
- Lọc booking theo ngày/trạng thái
- Chi tiết booking

#### APIs sử dụng:

- `POST /api/booking-management-for-keeper/create/passerby` - Tạo booking cho passerby (khách vãng lai)
- `GET /api/booking-management-for-keeper/{keeperId}/parkings?pageNo={pageNo}&pageSize={pageSize}` - Danh sách booking theo Keeper
- `GET /api/booking-management-for-keeper/keeper/{keeperId}?searchString={searchString}` - Tìm kiếm booking
- `GET /api/booking-management-for-keeper/filters/{keeperId}/parkings?date={date}&status={status}&pageNo={pageNo}&pageSize={pageSize}` - Lọc booking
- `GET /api/keeper/booking-Infomation?bookingId={bookingId}` - Thông tin chi tiết booking

#### Screens:

1. Keeper Dashboard Screen
2. Booking List Screen
3. Create Passerby Booking Screen
4. Booking Detail Screen

#### Priority: **P0 (Critical)**

---

### 🟠 MODULE 11: Keeper - Slot Management

#### Chức năng:

- Xem slot khả dụng
- Đổi slot cho khách hàng
- Xử lý khách đến sớm
- Vô hiệu hóa/Kích hoạt slot

#### APIs sử dụng:

- `GET /api/keeper/parking-slot/floors/floor/parking-slots`
- `GET /api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby`
- `PUT /api/keeper/parking-slot/change`
- `PUT /api/keeper/parking-slot/change/come-early`
- `POST /api/keeper/parking-slot/disable`
- `PUT /api/keeper/parking-slot/enable`

#### Screens:

1. Available Slots Screen
2. Change Slot Screen
3. Slot Management Screen

#### Priority: **P0 (Critical)**

---

### 🟣 MODULE 12: Keeper - Conflict Request

#### Chức năng:

- Xem danh sách conflict request
- Xử lý conflict

#### APIs sử dụng:

- `GET /api/conflict-request/keeper/{keeperId}` - Danh sách conflict request (chỉ Keeper có quyền)

#### Screens:

1. Conflict Request List Screen
2. Conflict Detail Screen

#### Priority: **P1 (High)**

---

## 🗓️ ROADMAP TRIỂN KHAI

### Phase 1: Foundation (Week 1-2) ⚡ ✅ ĐÃ HOÀN THÀNH

**Mục tiêu**: Setup project, authentication, navigation

#### Week 1:

- [x] Setup project structure ✅
- [x] Setup API service layer ✅
- [x] Implement authentication module ✅
  - Unified login: `POST /api/business-manager-authentication` (Email/Password)
  - Role detection từ JWT token ✅
  - Auto-navigation based on role ✅
- [x] Setup navigation/routing ✅
  - **UNIFIED approach**: Role-based navigation
  - ManagerNavigator vs TabNavigator (Keeper) ✅
  - Stack navigation trong mỗi tab ✅
- [x] Design system setup ✅
  - React Native Paper theme ✅
  - Tiếng Việt UI ✅

#### Week 2:

- [x] Profile management ✅
- [x] Error handling & logging ✅
- [x] Loading states ✅
- [x] Basic UI components ✅
- [x] Bypass login cho dev mode ✅
- [x] Map picker integration ✅

**Deliverables**: ✅ App có thể login, detect role, navigate theo role, xem profile - **HOÀN THÀNH**

---

### Phase 2: Manager Core Features (Week 3-5) 🏗️

**Mục tiêu**: Triển khai các tính năng cốt lõi của Manager

#### Week 3: Parking Management 🚧 ĐANG THỰC HIỆN

- [x] Parking list screen (với search, filter) ✅
- [x] Create/Edit parking screen ✅
  - Form với validation ✅
  - Map picker integration ✅ (Google Maps WebView)
  - IsPrepayment & IsOvernight switches ✅
- [x] Parking detail screen ✅
- [ ] Disable/Enable parking
- [ ] Schedule disable parking (by date/datetime)
- [ ] Cancel scheduled disable
- [ ] Parking disable history (scheduled & successed)
- [x] Map integration (update location lat/lng) ✅ (MapPickerScreen)
- [x] Parking API integration ✅
  - parkingApi.ts ✅
  - parkingSlice.ts ✅
  - Response format handling ✅

#### Week 4: Floor & Slot Management

- [ ] Floor management (CRUD)
- [ ] Slot management (CRUD)
- [ ] Floor detail với slot grid

#### Week 5: Booking Management

- [ ] Booking list với filter
- [ ] Booking detail
- [ ] Approve booking
- [ ] Check-out
- [ ] Mark done

**Deliverables**: Manager có thể quản lý bãi đỗ, tầng, slot và booking cơ bản

---

### Phase 3: Manager Advanced Features (Week 6-7) 📊

**Mục tiêu**: Pricing, Keeper management, Statistics

#### Week 6: Pricing & Keeper Management

- [ ] Pricing management (CRUD)
- [ ] Timeline management
- [ ] Assign price to parking
- [ ] Keeper management (CRUD)

#### Week 7: Statistics & Reports

- [ ] Statistics dashboard
- [ ] Revenue charts
- [ ] Booking statistics
- [ ] Data visualization

**Deliverables**: Manager có đầy đủ tính năng quản lý

---

### Phase 4: Keeper Features (Week 8-9) 👷

**Mục tiêu**: Triển khai tất cả tính năng cho Keeper

#### Week 8: Keeper Core

- [ ] Keeper dashboard
- [ ] Create passerby booking
- [ ] Booking list & search
- [ ] Booking detail

#### Week 9: Keeper Slot & Conflict

- [ ] Slot management (change, disable)
- [ ] Available slots view
- [ ] Conflict request handling
- [ ] Handle early arrival

**Deliverables**: Keeper có đầy đủ tính năng

---

### Phase 5: Polish & Optimization (Week 10-11) ✨

**Mục tiêu**: Tối ưu, fix bugs, improve UX

#### Week 10:

- [ ] Real-time updates (SignalR integration)
- [ ] Responsive design cho tablet (Manager optimization)
  - Sidebar navigation cho tablet
  - 2-column layouts
  - Expanded tables và charts
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Permission guards implementation
- [ ] Offline support (optional)

#### Week 11:

- [ ] UI/UX improvements
- [ ] Bug fixes
- [ ] Loading states (skeleton loaders)
- [ ] Toast notifications
- [ ] Pull to refresh (đã có trong ParkingListScreen ✅)
- [ ] Empty states improvements

**Deliverables**: App mượt mà, ổn định

---

### Phase 6: Testing & Deployment (Week 12) 🚀

**Mục tiêu**: Testing, deployment, documentation

#### Week 12:

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] UAT (User Acceptance Testing)
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment preparation

**Deliverables**: App sẵn sàng production

---

## 🛠️ CÔNG NGHỆ STACK

### ✅ Technology Stack: **React Native (UNIFIED APP)** ⭐

**Platform**: React Native - Mobile-First, Responsive Design

- **Target**: iOS + Android (Mobile)
- **Tablet Support**: Responsive design cho Manager trên tablet
- **Approach**: Unified app với role-based UI rendering

### Current Stack (Đang sử dụng):

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.1.19",
    "@react-navigation/bottom-tabs": "^7.4.7",
    "@react-navigation/stack": "^7.4.8",
    "@reduxjs/toolkit": "^2.2.5",
    "react-redux": "^9.1.2",
    "axios": "^1.7.7",
    "react-native-paper": "^5.12.5",
    "react-native-vector-icons": "^10.2.0",
    "@react-native-async-storage/async-storage": "^1.24.0",
    "expo": "^54.0.10",
    "expo-secure-store": "^15.0.7",
    "expo-location": "latest",
    "react-native-webview": "latest",
    "@microsoft/signalr": "^8.0.7",
    "react": "19.1.0",
    "react-native": "0.81.4"
  }
}
```

### Additional Libraries Cần Thêm:

```json
{
  "dependencies": {
    "react-native-chart-kit": "^6.12.0", // Cho charts (Statistics)
    "react-native-maps": "^1.0.0", // Native maps (optional - hiện dùng WebView)
    "date-fns": "^4.1.0" // ✅ Đã có
  }
}
```

### SignalR Client:

- **React Native**: `@microsoft/signalr` ✅ (Đã cài)

### Future: Optional Web App (Nếu Manager cần desktop experience tốt hơn)

**Có thể build sau** với React/Next.js:

- Share: Business logic, API layer, types
- Separate: UI components, navigation

**Khuyến nghị**: Hiện tại focus vào mobile app unified, web app là optional phase 2

---

## ✅ CHECKLIST TRIỂN KHAI

### Pre-development ✅

- [x] Chọn công nghệ stack: **React Native (UNIFIED)** ✅
- [x] Setup development environment ✅
- [ ] Setup CI/CD pipeline (optional)
- [x] Create design system ✅ (React Native Paper)
- [x] API documentation review ✅
- [x] Create project structure ✅

### Development ✅

- [x] Authentication flow ✅ (Unified login với role detection)
- [x] Navigation structure ✅ (Role-based navigation)
- [x] API service layer ✅ (apiClient.ts với interceptors)
- [x] State management setup ✅ (Redux Toolkit)
- [x] Error handling ✅
- [x] Loading states ✅
- [x] Form validation ✅
- [ ] Permission guards (cần bổ sung)
- [ ] Responsive design hooks (cần bổ sung)

### Manager Features

- [ ] Parking CRUD
- [ ] Floor CRUD
- [ ] Slot CRUD
- [ ] Pricing management
- [ ] Timeline management
- [ ] Booking management
- [ ] Keeper management
- [ ] Statistics dashboard
- [ ] Business profile
- [ ] Image management

### Keeper Features

- [ ] Booking creation
- [ ] Booking list & search
- [ ] Slot management
- [ ] Conflict handling
- [ ] Dashboard

### Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing
- [ ] Performance testing
- [ ] Security testing

### Deployment

- [ ] Staging deployment
- [ ] UAT
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Analytics integration
- [ ] Documentation

---

## 📱 UI/UX CONSIDERATIONS

### Design Approach: **UNIFIED APP - Role-Based UI Rendering** ⭐

**Principle**: Một codebase, role-based UI, responsive design

### Design Principles:

1. **Role-based Navigation**: Manager và Keeper có navigation khác nhau (đã implement ✅)
2. **Shared Screens**: Login, Profile dùng chung với conditional content
3. **Role-specific Screens**: Manager/Keeper có screens riêng
4. **Responsive Design**: Mobile-first, tablet optimization cho Manager
5. **Quick Actions**: Quick access cho các action thường dùng
6. **Real-time Updates**: SignalR integration cho updates (chưa có)
7. **Offline Support**: Cache data quan trọng (optional)
8. **Consistent UX**: Cùng design system, patterns cho cả 2 roles

### Navigation Structure:

**Manager (Mobile/Tablet)**:

- Bottom Tabs: Bãi đỗ | Đặt chỗ | Nhân viên | Thống kê | Hồ sơ
- Stack navigation trong mỗi tab

**Keeper (Mobile)**:

- Bottom Tabs: Trang chủ | Đặt chỗ | Slot | Xung đột | Hồ sơ
- Stack navigation trong mỗi tab

**Responsive (Tablet - Manager)**:

- Có thể thêm sidebar navigation khi screen >= 768px
- 2-column layout cho list/detail
- Expanded tables và charts

### Key Screens:

**Shared Screens:**

- ✅ Login Screen: Role selection (Manager/Keeper) - đã có
- ✅ Profile Screen: Conditional content based on role - đã có
- ⏳ Booking Detail: Conditional actions (Manager: Approve, Keeper: Change Slot)

**Manager Screens:**

- ⏳ Manager Dashboard: Stats cards, charts, quick actions
- ✅ Parking List: Search, filter - đã có
- ✅ Parking Detail: Info, actions - đã có
- ✅ Create/Edit Parking: Form với map picker - đã có
- ⏳ Booking Management: List, approve, checkout
- ⏳ Keeper Management: List, create, enable/disable
- ⏳ Statistics: Charts, reports

**Keeper Screens:**

- ⏳ Keeper Dashboard: Quick stats, today's bookings
- ⏳ Booking List: Search, filter
- ⏳ Create Passerby Booking: Form
- ⏳ Slot Management: Grid view, change, disable
- ⏳ Conflict Requests: List, detail

### Responsive Design Strategy:

**Mobile (< 768px)**:

- Bottom tab navigation
- Single column layout
- Cards và lists
- Full-screen modals

**Tablet (>= 768px) - Manager**:

- Sidebar navigation (optional)
- Two-column layout
- Expanded tables
- Split-screen cho detail views

**Implementation**:

```typescript
// useDeviceType.ts (cần implement)
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<"phone" | "tablet">("phone");
  // Detect based on Dimensions.get('window').width
  return deviceType;
};
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **Token Management**: Secure storage, refresh token
2. **API Security**: HTTPS only, certificate pinning
3. **Input Validation**: Client-side và server-side
4. **Role-based Access**: Enforce permissions
5. **Data Encryption**: Sensitive data encryption
6. **Session Management**: Auto-logout after inactivity

---

## 📊 METRICS & MONITORING

### Key Metrics:

- App crashes
- API response times
- User sessions
- Feature usage
- Error rates

### Tools:

- **Analytics**: Firebase Analytics / Mixpanel
- **Crash Reporting**: Firebase Crashlytics / Sentry
- **Performance**: Firebase Performance / New Relic

---

## 📝 NOTES

### Architecture Decision: **UNIFIED APP Approach** ⭐

**Chosen Approach**: UNIFIED_APP_DESIGN.md - Một React Native app cho cả Manager và Keeper

**Reasons**:

1. ✅ Code reuse cao - shared components, API layer, business logic
2. ✅ Maintenance dễ - một codebase, fix bug một lần
3. ✅ Cost-effective - một team, một deployment
4. ✅ Flexibility - Manager có thể dùng mobile/tablet
5. ✅ Consistent UX - cùng design system

**Implementation Status**:

- ✅ Role-based navigation đã implement
- ✅ Shared screens (Login, Profile)
- ✅ Manager screens (Parking Management)
- ⏳ Responsive design cho tablet (cần implement)
- ⏳ Permission guards (cần implement)
- ⏳ Dashboard screens (cần implement)

### API Endpoints Summary (Dựa trên thực tế)

**Backend URL:** `http://103.56.161.75/api`  
**Swagger UI:** `http://103.56.161.75/swagger/index.html`

**Tổng số API:**

- **Manager:** ~50+ endpoints
- **Keeper:** ~12 endpoints
- **Shared:** ~5 endpoints (Login, Profile, Change Password, etc.)

**Phân loại:**

1. Authentication (2)
2. Parking Management (13)
3. Floor Management (5)
4. Slot Management (Manager: 3, Keeper: 6)
5. Pricing & Timeline (13)
6. Booking Management (Manager: 6, Keeper: 5)
7. Keeper Management (5)
8. Business Profile (3)
9. Image Management (4)
10. Statistics & Charts (6)
11. Conflict Request (1 - Keeper only)
12. Account Management (1)

### Implementation Notes

1. **UNIFIED APP Architecture** ✅

   - Role-based navigation: ManagerNavigator vs TabNavigator ✅
   - Shared screens: Login, Profile với conditional content ✅
   - Role-specific screens: Manager và Keeper có screens riêng ✅
   - Permission guards: Cần implement (useRolePermission hook)
   - Responsive design: Tablet optimization cho Manager (cần implement)

2. **SignalR Integration**: Cần implement cho real-time updates

   - `LoadHistoryInManager` (Booking approve/checkout)
   - `LoadKeeperAccounts` (Keeper create/delete)
   - `LoadBusinessProfileInAdmin` (Business profile update)

3. **Map Integration**: ✅ Đã implement

   - MapPickerScreen với Google Maps WebView ✅
   - Expo Location để lấy vị trí hiện tại ✅
   - Update parking location (lat/lng) ✅
   - **Note**: Cần cấu hình Google Maps API Key trong MapPickerScreen

4. **Chart Library**: Cần implement cho statistics

   - **Recommend**: `react-native-chart-kit` hoặc `victory-native`
   - Pie charts (Done/Cancel booking)
   - Line charts (Revenue by week/month)
   - Card statistics (Overview)

5. **Image Upload**: Cần handle image upload cho parking images

   - Multi-image upload
   - Image preview/delete
   - **Library**: `expo-image-picker` + `expo-file-system`

6. **Pagination**: Hầu hết API list đều có pagination ✅

   - Default: `pageNo=1`, `pageSize=10` ✅
   - Đã implement trong parkingApi ✅

7. **Role-based Access**: ✅ Đã implement navigation, cần bổ sung guards

   - Manager và Keeper có endpoint riêng ✅
   - Một số API dùng chung (Login, Profile) ✅
   - **Cần thêm**: Route guards, permission hooks

8. **Responsive Design**: Cần implement

   - **Mobile (< 768px)**: Bottom tabs (hiện tại) ✅
   - **Tablet (>= 768px)**: Sidebar navigation, 2-column layout
   - **Hook**: `useDeviceType` để detect device type

9. **Offline Support**: Cân nhắc implement cho critical features

10. **Internationalization**: ✅ Đã implement tiếng Việt

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Success:

- ✅ User có thể login
- ✅ Navigation hoạt động

### Phase 2 Success:

- ✅ Manager quản lý được parking, floor, slot
- ✅ Manager quản lý được booking

### Phase 3 Success:

- ✅ Manager có đầy đủ tính năng quản lý

### Phase 4 Success:

- ✅ Keeper có thể tạo booking và quản lý slot

### Phase 5 Success:

- ✅ App mượt mà, ít bug
- ✅ UX tốt

### Phase 6 Success:

- ✅ App sẵn sàng production
- ✅ Documentation đầy đủ

---

## 📅 TIMELINE TÓM TẮT

| Phase                     | Duration | Key Deliverables              |
| ------------------------- | -------- | ----------------------------- |
| Phase 1: Foundation       | 2 weeks  | Authentication, Navigation    |
| Phase 2: Manager Core     | 3 weeks  | Parking, Floor, Slot, Booking |
| Phase 3: Manager Advanced | 2 weeks  | Pricing, Keeper, Statistics   |
| Phase 4: Keeper Features  | 2 weeks  | Booking, Slot, Conflict       |
| Phase 5: Polish           | 2 weeks  | Optimization, UX              |
| Phase 6: Testing & Deploy | 1 week   | Production ready              |

**Total: 12 weeks (~3 months)**

---

## 🚀 NEXT STEPS

1. **Review và approve kế hoạch**
2. **Setup project structure**
3. **Assign team members**
4. **Begin Phase 1**
5. **Daily standup và weekly review**

---

_Document created: 2024_
_Last updated: 2024_
