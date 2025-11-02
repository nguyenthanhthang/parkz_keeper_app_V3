# HƯỚNG DẪN THIẾT KẾ UI/UX CHO MANAGER VÀ KEEPER APP

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [User Personas & Use Cases](#user-personas--use-cases)
3. [Thiết kế Manager App](#thiết-kế-manager-app)
4. [Thiết kế Keeper App](#thiết-kế-keeper-app)
5. [Design System](#design-system)
6. [Navigation Structure](#navigation-structure)
7. [Screen Flows](#screen-flows)
8. [Technology Stack](#technology-stack)

---

## 📊 TỔNG QUAN

### Manager App (Web Application)
- **Platform**: Desktop/Tablet Web App (React, Vue, Angular)
- **Mục đích**: Quản lý toàn bộ hệ thống bãi đỗ xe
- **Đặc điểm**: Dashboard phức tạp, nhiều module, data visualization
- **Device**: Desktop/Tablet (responsive)

### Keeper App (Mobile Application)
- **Platform**: Mobile App (React Native, Flutter, Native)
- **Mục đích**: Thực thi tại chỗ, hỗ trợ khách hàng
- **Đặc điểm**: Giao diện đơn giản, dễ sử dụng, tốc độ nhanh
- **Device**: Smartphone (iOS/Android)

---

## 👥 USER PERSONAS & USE CASES

### Manager Persona
- **Tên**: Nguyễn Văn A - Chủ bãi đỗ xe
- **Tuổi**: 35-50
- **Công việc**: Quản lý 1-5 bãi đỗ xe
- **Môi trường**: Văn phòng, làm việc trên máy tính
- **Mục tiêu**: 
  - Quản lý toàn bộ bãi đỗ hiệu quả
  - Theo dõi doanh thu và thống kê
  - Quản lý nhân viên (Keeper)
  - Duyệt booking và kiểm soát hoạt động

### Keeper Persona
- **Tên**: Trần Thị B - Nhân viên tại bãi đỗ
- **Tuổi**: 20-40
- **Công việc**: Quản lý booking và slot tại 1 bãi đỗ cụ thể
- **Môi trường**: Ngoài trời, di chuyển nhiều, cầm điện thoại
- **Mục tiêu**:
  - Tạo booking cho khách passerby nhanh chóng
  - Quản lý slot và đổi slot khi cần
  - Xử lý conflict và hỗ trợ khách hàng
  - Làm việc hiệu quả với ít thao tác

---

## 🖥️ THIẾT KẾ MANAGER APP (Web Application)

### 1. Navigation Structure

```
┌─────────────────────────────────────────┐
│            HEADER (Fixed Top)           │
│  Logo | Notifications | Profile Menu   │
└─────────────────────────────────────────┘
┌─────────┬──────────────────────────────┐
│ SIDEBAR │      MAIN CONTENT AREA       │
│         │                              │
│ 🏠 Home │  ┌────────────────────────┐ │
│ 🏢 Bãi  │  │                        │ │
│   Đỗ    │  │    Dashboard/Content   │ │
│         │  │                        │ │
│ 📅      │  │                        │ │
│ Booking │  └────────────────────────┘ │
│         │                              │
│ 💰 Giá  │                              │
│         │                              │
│ 👥      │                              │
│ Keeper  │                              │
│         │                              │
│ 📊 Thống│                              │
│   Kê    │                              │
│         │                              │
│ ⚙️      │                              │
│ Settings│                              │
└─────────┴──────────────────────────────┘
```

### 2. Screen List

#### **A. Dashboard (Home)**
- **Purpose**: Tổng quan hệ thống
- **Components**:
  - **Statistics Cards**: 
    - Tổng số bãi đỗ đang hoạt động
    - Tổng booking hôm nay
    - Doanh thu hôm nay/tuần/tháng
    - Số keeper đang làm việc
  - **Revenue Chart** (Line Chart): Doanh thu 7 ngày/30 ngày gần nhất
  - **Booking Status Pie Chart**: Done/Cancel/Pending
  - **Recent Activities**: Danh sách booking mới nhất
  - **Quick Actions**: Tạo bãi đỗ, Duyệt booking, Tạo keeper

**API Used:**
- `GET /api/chart/card/statistic-card?managerId={id}`
- `GET /api/chart/line/month-or-week-revenue?managerId={id}`
- `GET /api/chart/pie/done-cancel-booking?managerId={id}`
- `GET /api/booking-management/request/{managerId}` (limit 5)

---

#### **B. Parking Management**
**B1. Parking List Screen**
- **Purpose**: Danh sách tất cả bãi đỗ
- **Layout**: 
  - Search bar + Filter (Status: All/Active/Inactive)
  - Grid/List view toggle
  - Parking cards với:
    - Hình ảnh bãi đỗ
    - Tên, địa chỉ
    - Status badge (Active/Inactive/Full)
    - Số slot/Booking hôm nay
    - Quick actions: Edit, Disable, View Detail
- **API**: `GET /api/parkings?managerId={id}&pageNo={pageNo}&pageSize={pageSize}`

**B2. Parking Detail Screen**
- **Tabs**:
  - **Overview**: Thông tin cơ bản, hình ảnh, location map
  - **Floors & Slots**: Danh sách tầng và slot (visual grid)
  - **Booking**: Booking của bãi đỗ này
  - **Statistics**: Thống kê bãi đỗ
- **Actions**: Edit, Disable/Enable, Schedule Disable
- **APIs**:
  - `GET /api/parkings/{parkingId}`
  - `GET /api/floors/parking/{parkingId}`
  - `GET /api/booking-management/parkings/{parkingId}`
  - `GET /api/chart/card/parkings/{parkingId}/statistic-card`

**B3. Create/Edit Parking Screen**
- **Form Fields**:
  - Tên bãi đỗ
  - Địa chỉ
  - Mô tả
  - Location picker (Google Maps)
  - Upload images
  - Business hours
- **API**: 
  - `POST /api/parkings/parking`
  - `PUT /api/parkings/parking/{parkingId}`

---

#### **C. Floor Management**
**C1. Floor List Screen**
- **Context**: Hiển thị trong Parking Detail > Floors tab
- **Components**:
  - Button "Thêm tầng mới"
  - List of floors với:
    - Tên tầng, số slot
    - Status (Active/Inactive)
    - Actions: Edit, Disable, View Slots
- **API**: `GET /api/floors/parking/{parkingId}`

**C2. Floor Detail Screen**
- **Components**:
  - Visual slot grid (interactive)
  - Filter: Available/Occupied/Disabled
  - Add Slot button
  - Slot detail modal
- **API**: `GET /api/parkingSlot/floor/{floorId}`

**C3. Create/Edit Floor Form**
- **Modal/Drawer**
- **Fields**: Tên tầng, mô tả
- **API**: 
  - `POST /api/floors/floor`
  - `PUT /api/floors/floor/{floorId}`

---

#### **D. Booking Management**
**D1. Booking List Screen**
- **Purpose**: Quản lý toàn bộ booking
- **Components**:
  - **Filters**: 
    - Status (All/Pending/Approved/Done/Cancel)
    - Parking (dropdown)
    - Date range picker
  - **Search**: Tìm kiếm booking
  - **Table/List**:
    - Booking ID
    - Khách hàng (Tên, SĐT)
    - Bãi đỗ, Slot
    - Thời gian (Start - End)
    - Status badge
    - Actions: View Detail, Approve, Check-out
- **API**: `GET /api/booking-management/request/{managerId}?pageNo={pageNo}&pageSize={pageSize}`

**D2. Booking Detail Screen**
- **Components**:
  - Customer info card
  - Parking & Slot info
  - Time info (Start, End, Duration)
  - Vehicle info
  - Price breakdown
  - Status và actions:
    - Pending → Approve button
    - Approved → Check-out button
    - Done → Mark as Done
- **APIs**:
  - `GET /api/booking-management/{bookingId}`
  - `POST /api/booking-management/approve-booking`
  - `PUT /api/booking-management/check-out`
  - `PUT /api/booking-management/done`

---

#### **E. Pricing Management**
**E1. Parking Price List**
- **Purpose**: Quản lý bảng giá
- **Components**:
  - List of pricing tables
  - Each card: Tên, mô tả, status, actions
- **API**: `GET /api/parking-price`

**E2. Create/Edit Pricing**
- **Form**:
  - Tên bảng giá
  - Mô tả
  - Status toggle
  - Timeline section (add time slots with prices)
- **APIs**:
  - `POST /api/parking-price/create`
  - `POST /api/timeline-management` (for each time slot)

**E3. Assign Price to Parking**
- **Screen**: Select parking và assign price
- **API**: `POST /api/parkingHasPrice`

---

#### **F. Keeper Management**
**F1. Keeper List Screen**
- **Components**:
  - Search bar
  - Add Keeper button
  - List cards:
    - Avatar, Tên, Email, SĐT
    - Bãi đỗ được gán
    - Status (Active/Inactive)
    - Actions: View Detail, Disable/Enable
- **API**: `GET /api/keeper-account-management?managerId={id}&pageNo={pageNo}&pageSize={pageSize}`

**F2. Create Keeper Screen**
- **Form Fields**:
  - Name, Email, Phone
  - Date of Birth, Gender
  - Avatar upload
  - Select Parking (dropdown)
  - Manager ID (auto-fill)
- **API**: `POST /api/keeper-account-management/register`

---

#### **G. Statistics & Reports**
**G1. Statistics Dashboard**
- **Tabs**:
  - **Overview**: Tổng quan (cards + charts)
  - **Revenue**: Doanh thu theo thời gian (Line chart)
  - **Booking**: Booking stats (Pie chart)
  - **Parking**: Thống kê theo bãi đỗ
- **APIs**:
  - `GET /api/chart/card/statistic-card?managerId={id}`
  - `GET /api/chart/line/month-or-week-revenue?managerId={id}`
  - `GET /api/chart/pie/done-cancel-booking?managerId={id}`

---

### 3. Manager App UI Components

#### **Design Patterns:**
- **Sidebar Navigation**: Fixed left sidebar với icons
- **Data Tables**: Sortable, filterable tables với pagination
- **Cards**: Stats cards, parking cards, booking cards
- **Modals/Drawers**: Forms (Create/Edit)
- **Toast Notifications**: Success/Error messages
- **Loading States**: Skeleton loaders, spinners
- **Empty States**: Khi không có data

#### **Color Scheme:**
- **Primary**: Blue (#1890ff) - Actions, buttons
- **Success**: Green (#52c41a) - Approved, Done
- **Warning**: Orange (#faad14) - Pending
- **Error**: Red (#f5222d) - Cancelled, Error
- **Neutral**: Gray (#8c8c8c) - Inactive, Disabled

---

## 📱 THIẾT KẾ KEEPER APP (Mobile Application)

### 1. Navigation Structure

```
┌─────────────────────────┐
│      HEADER (Top)        │
│  Profile | Notifications │
└─────────────────────────┘
│                          │
│   TAB BAR (Bottom)       │
│ ┌─────┬─────┬─────┬────┐│
│ │Home │Booking│Slot│Profile│
│ └─────┴─────┴─────┴────┘│
└─────────────────────────┘
```

### 2. Screen List

#### **A. Home/Dashboard Screen**
- **Purpose**: Tổng quan nhanh cho Keeper
- **Components**:
  - **Header**: 
    - Avatar + Tên keeper
    - Bãi đỗ hiện tại (badge)
    - Mark Full button (prominent)
  - **Quick Stats Cards**:
    - Booking hôm nay (count)
    - Slot available (count)
    - Conflict requests (count với badge nếu > 0)
  - **Quick Actions**:
    - "Tạo booking mới" (large button)
    - "Xem slot" (button)
  - **Today's Bookings**: List ngắn (3-5 items)
- **APIs**:
  - `GET /api/keeper-account-management/{userId}`
  - `GET /api/booking-management-for-keeper/{keeperId}/parkings?pageNo=1&pageSize=5`
  - `GET /api/conflict-request/keeper/{keeperId}` (count)

---

#### **B. Booking Management**
**B1. Booking List Screen**
- **Components**:
  - **Search Bar**: Tìm kiếm booking (by customer name, phone, booking ID)
  - **Filter Tabs**: All | Today | Pending | Done
  - **Date Picker**: Filter by date
  - **List Items**:
    - Booking ID
    - Customer info (Tên, SĐT)
    - Slot number
    - Time range (Start - End)
    - Status badge
    - Tap → Booking Detail
- **APIs**:
  - `GET /api/booking-management-for-keeper/{keeperId}/parkings?pageNo={pageNo}&pageSize={pageSize}`
  - `GET /api/booking-management-for-keeper/filters/{keeperId}/parkings?date={date}&status={status}`
  - `GET /api/booking-management-for-keeper/keeper/{keeperId}?searchString={query}`

**B2. Create Passerby Booking Screen**
- **Purpose**: Tạo booking cho khách passerby (ngay tại chỗ)
- **Flow**:
  1. Chọn slot khả dụng (với thời gian)
  2. Nhập thông tin khách:
     - Tên
     - SĐT
     - Biển số xe
     - Loại xe (dropdown)
  3. Chọn thời gian (Start time - End time hoặc Duration)
  4. Xem giá (auto-calculate)
  5. Confirm → Create
- **API**: `POST /api/booking-management-for-keeper/create/passerby`

**B3. Booking Detail Screen**
- **Components**:
  - Customer info card (Tên, SĐT)
  - Vehicle info (Biển số, loại xe)
  - Parking & Slot info
  - Time info (Start, End, Duration)
  - Price info
  - Status badge
  - Actions (nếu có):
    - Change Slot (nếu đang trong thời gian)
    - View on map
- **API**: `GET /api/keeper/booking-Infomation?bookingId={id}`

---

#### **C. Slot Management**
**C1. Available Slots Screen**
- **Purpose**: Xem slot khả dụng và quản lý slot
- **Components**:
  - **Floor Selector**: Dropdown chọn tầng
  - **Slot Grid** (Visual):
    - Mỗi slot = card/box
    - Color coding:
      - Green: Available
      - Red: Occupied
      - Yellow: Disabled
      - Blue: Selected
    - Tap slot → Show detail/actions
  - **Filter**: Available | All | Disabled
- **APIs**:
  - `GET /api/keeper/parking-slot/floors/floor/parking-slots?floorId={id}`
  - `GET /api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby?floorId={id}&startTime={time}`

**C2. Slot Detail Modal**
- **Actions**:
  - Disable Slot (với reason và duration)
  - Enable Slot (nếu đang disabled)
  - Change Slot for Customer (nếu có booking)
- **APIs**:
  - `POST /api/keeper/parking-slot/disable`
  - `PUT /api/keeper/parking-slot/enable`
  - `PUT /api/keeper/parking-slot/change`

**C3. Change Slot Screen**
- **Flow**:
  1. Select booking (hoặc nhập booking ID)
  2. Select new slot
  3. Confirm → Change
- **API**: `PUT /api/keeper/parking-slot/change`
- **Special**: Change when customer come early
  - `PUT /api/keeper/parking-slot/change/come-early`

---

#### **D. Conflict Request**
**D1. Conflict List Screen**
- **Purpose**: Xem và xử lý conflict requests
- **Components**:
  - List of conflicts:
    - Booking info (ID, customer)
    - Slot info
    - Conflict reason
    - Timestamp
    - Status (Pending/Resolved)
  - Badge số lượng chưa xử lý
- **API**: `GET /api/conflict-request/keeper/{keeperId}?pageNo={pageNo}&pageSize={pageSize}`

**D2. Conflict Detail Screen**
- **Components**:
  - Conflict info
  - Booking details
  - Slot info
  - Actions: Resolve (nếu cần)

---

#### **E. Profile Screen**
- **Components**:
  - Avatar + User info
  - Bãi đỗ được gán
  - Change Password
  - Logout
- **APIs**:
  - `GET /api/keeper-account-management/{userId}`
  - `PUT /api/my-manager-account/{userId}` (change password)

---

### 3. Keeper App UI Components

#### **Design Patterns:**
- **Bottom Tab Navigation**: 4-5 main tabs
- **Card-based Layout**: Booking cards, slot cards
- **Swipe Actions**: Swipe left/right để actions nhanh
- **Pull to Refresh**: Refresh data
- **Bottom Sheet**: Modals từ dưới lên (iOS style)
- **Search Bar**: Sticky top search
- **Status Badges**: Color-coded status

#### **Color Scheme:**
- **Primary**: Green (#52c41a) - Available, Success
- **Warning**: Orange (#faad14) - Pending, Attention
- **Error**: Red (#f5222d) - Occupied, Conflict, Error
- **Info**: Blue (#1890ff) - Actions
- **Neutral**: Gray (#bfbfbf) - Disabled

---

## 🎨 DESIGN SYSTEM

### Typography
- **Headings**: 
  - H1: 24-32px, Bold
  - H2: 20-24px, Semi-bold
  - H3: 18-20px, Medium
- **Body**: 14-16px, Regular
- **Caption**: 12px, Regular

### Spacing
- **Base Unit**: 4px hoặc 8px
- **Padding**: 12px, 16px, 24px
- **Margin**: 8px, 16px, 24px, 32px

### Icons
- **Icon Library**: Material Icons / Ant Design Icons / Font Awesome
- **Sizes**: 16px, 20px, 24px, 32px

### Buttons
- **Primary**: Full width hoặc fixed width, rounded corners
- **Secondary**: Outlined style
- **Icon Buttons**: Circular, 40-48px
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Forms
- **Input Fields**: 
  - Rounded corners (8px)
  - Label on top
  - Error states rõ ràng
  - Helper text
- **Dropdown**: Native select hoặc custom dropdown
- **Date/Time Picker**: Native pickers

---

## 🔄 SCREEN FLOWS

### Manager App Flows

**Flow 1: Duyệt Booking**
```
Dashboard → Booking List → Booking Detail → [Approve Button] → Success → Back to List
```

**Flow 2: Tạo Bãi Đỗ Mới**
```
Parking List → [Add Button] → Create Parking Form → [Submit] → Success → Parking Detail
```

**Flow 3: Quản lý Keeper**
```
Sidebar → Keeper Management → Keeper List → [Add Keeper] → Create Form → Submit → List Updated
```

### Keeper App Flows

**Flow 1: Tạo Booking Passerby**
```
Home → [Create Booking] → Select Slot → Enter Customer Info → Select Time → Confirm → Success
```

**Flow 2: Đổi Slot**
```
Booking Detail → [Change Slot] → Select New Slot → Confirm → Success
```

**Flow 3: Disable Slot**
```
Slot List → [Tap Slot] → Slot Detail → [Disable] → Reason Modal → Duration → Confirm → Success
```

---

## 💻 TECHNOLOGY STACK RECOMMENDATIONS

### Manager App (Web)

**Frontend Framework:**
- **React** + TypeScript (recommended)
  - React Router (routing)
  - Redux Toolkit / Zustand (state management)
  - React Query / SWR (data fetching)
  - Ant Design / Material-UI (component library)
- **Vue 3** + TypeScript (alternative)
  - Vue Router
  - Pinia / Vuex
  - Ant Design Vue / Vuetify

**Chart Library:**
- **Recharts** (React) hoặc **Chart.js** / **ECharts**

**Map Integration:**
- **Google Maps API** hoặc **Mapbox**

**Build Tool:**
- **Vite** (recommended) hoặc **Create React App**

---

### Keeper App (Mobile)

**Option 1: React Native** (recommended - cross-platform)
- **React Native** + TypeScript
- **React Navigation** (navigation)
- **Redux Toolkit** / **Zustand** (state management)
- **React Query** (data fetching)
- **React Native Paper** / **NativeBase** (UI library)

**Option 2: Flutter** (alternative - cross-platform)
- **Flutter** + Dart
- **Provider** / **Riverpod** (state management)
- **GetX** (navigation, state)
- **Material Design** components

**Option 3: Native Apps**
- **Swift** (iOS) + **Kotlin** (Android)
- Higher performance, native feel

**Recommendation**: **React Native** vì:
- Code reuse giữa iOS và Android
- Có thể share code với Manager web (nếu dùng React)
- Large community, many libraries
- Good performance

---

## 📐 RESPONSIVE DESIGN

### Manager App
- **Desktop**: Full sidebar + wide content (1200px+)
- **Tablet**: Collapsible sidebar (768px - 1199px)
- **Mobile**: Bottom navigation (dưới 768px) - Optional

### Keeper App
- **Mobile First**: Designed cho smartphone
- **Tablet**: Scale up, có thể dùng 2 columns
- **Landscape**: Optimized cho slot grid view

---

## ✅ BEST PRACTICES

### UX Principles
1. **Minimize Clicks**: Thao tác nhanh nhất có thể
2. **Clear Feedback**: Loading states, success/error messages
3. **Offline Support**: Cache data, queue actions (nếu cần)
4. **Error Handling**: User-friendly error messages
5. **Accessibility**: Screen readers, keyboard navigation

### Performance
1. **Lazy Loading**: Load data khi cần
2. **Pagination**: Không load tất cả data một lúc
3. **Image Optimization**: Compress images, lazy load
4. **Code Splitting**: Split code theo routes

### Security
1. **Token Storage**: Secure storage (localStorage cho web, SecureStore cho mobile)
2. **Token Refresh**: Auto refresh token khi hết hạn
3. **Input Validation**: Validate ở cả client và server

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Features
1. ✅ Authentication (Login/Logout)
2. ✅ Manager: Dashboard, Parking List, Booking List
3. ✅ Keeper: Home, Booking List, Create Booking

### Phase 2: Management Features
1. ✅ Manager: Parking CRUD, Floor/Slot management
2. ✅ Manager: Booking approval, Check-out
3. ✅ Keeper: Slot management, Change slot

### Phase 3: Advanced Features
1. ✅ Manager: Pricing, Keeper management
2. ✅ Manager: Statistics & Charts
3. ✅ Keeper: Conflict requests

### Phase 4: Polish
1. ✅ Real-time updates (SignalR)
2. ✅ Notifications
3. ✅ Offline support (optional)

---

## 📋 CHECKLIST

### Manager App
- [ ] Authentication (Login/Register)
- [ ] Dashboard với stats và charts
- [ ] Parking Management (CRUD)
- [ ] Floor & Slot Management
- [ ] Booking Management (List, Detail, Approve, Check-out)
- [ ] Pricing Management
- [ ] Keeper Management
- [ ] Statistics & Reports
- [ ] Profile & Settings

### Keeper App
- [ ] Authentication (Login)
- [ ] Home Dashboard
- [ ] Booking List & Search
- [ ] Create Passerby Booking
- [ ] Booking Detail
- [ ] Slot Management (View, Disable, Enable)
- [ ] Change Slot
- [ ] Conflict Requests
- [ ] Profile

---

## 📝 NOTES

1. **Real-time Updates**: Sử dụng SignalR để update real-time (booking mới, slot changes)
2. **Permissions**: Check role và permissions trước khi hiển thị features
3. **Error Handling**: Handle 401 (Unauthorized), 403 (Forbidden), network errors
4. **Loading States**: Show skeleton loaders khi fetch data
5. **Empty States**: Show friendly messages khi không có data
6. **Validation**: Validate forms ở client trước khi submit

