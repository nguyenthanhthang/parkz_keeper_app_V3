# TOÀN BỘ API CỦA KEEPER

## 📋 TỔNG QUAN

Keeper (RoleId: 2) có **tổng cộng 13 API endpoints** để quản lý bãi đỗ xe.

**Base URL:** `http://172.25.0.102:5178/api` hoặc `https://localhost:7071/api`

**Authentication:** Tất cả API đều cần JWT token (trừ Login)

---

## 🔐 1. AUTHENTICATION (`/api/business-manager-authentication`)

### Login

- **POST** `/api/business-manager-authentication`
- **Description:** Keeper đăng nhập (dùng chung endpoint với Manager)
- **Auth:** Không cần
- **Request:**
  ```json
  {
    "email": "keeper1@parkz.com",
    "password": "123456"
  }
  ```
- **Response:** `{ "data": { "token": "..." }, "success": true, "message": "Chào mừng [Tên Keeper]" }`

### ⚠️ ĐIỀU KIỆN ĐĂNG NHẬP CỦA KEEPER:

Keeper **BẮT BUỘC** phải thỏa mãn các điều kiện sau để đăng nhập được:

1. **Tài khoản Keeper phải được tạo trước:**

   - Email và password phải đúng
   - `IsActive = true` (tài khoản chưa bị khóa)
   - `IsCensorship = true` (tài khoản đã được duyệt)

2. **Keeper phải được gán vào một bãi đỗ (Parking):**

   - Keeper phải có `ParkingId` (không được null)
   - **Bãi đỗ phải đã được tạo sẵn** trong hệ thống
   - Bãi đỗ phải tồn tại trong database

3. **Bãi đỗ phải đang hoạt động:**
   - Parking phải có `IsAvailable = true`
   - Nếu `IsAvailable = false` → Keeper sẽ không đăng nhập được (lỗi: "Bãi đang bị quản lý khóa.")

### 📝 Lưu ý quan trọng:

- **Keeper được Manager tạo** qua API: `POST /api/keeper-account-management/register`
- Khi Manager tạo Keeper, **bắt buộc phải gán `ParkingId`** (chọn bãi đỗ cho keeper)
- Nếu Keeper chưa có ParkingId hoặc Parking không tồn tại → Lỗi: "Không tìm thấy bãi."
- Nếu Parking của Keeper bị khóa (`IsAvailable = false`) → Keeper không thể đăng nhập
- **Flow:** Manager tạo Parking → Manager tạo Keeper và gán vào Parking → Keeper mới có thể đăng nhập

---

## 🅿️ 2. PARKING SLOT MANAGEMENT (`/api/keeper/parking-slot`)

### Đổi slot cho khách

- **PUT** `/api/keeper/parking-slot/change`
- **Auth:** Keeper
- **Description:** Đổi slot cho khách hàng
- **Request Body:**
  ```json
  {
    "bookingId": 1,
    "newSlotId": 5
  }
  ```
- **Response:** `204 No Content` (khi thành công)

### Đổi slot khi khách đến sớm

- **PUT** `/api/keeper/parking-slot/change/come-early`
- **Auth:** Keeper
- **Description:** Đổi slot khi khách đến sớm hơn giờ đặt
- **Request Body:**
  ```json
  {
    "bookingId": 1,
    "newSlotId": 5
  }
  ```
- **Response:** `204 No Content` (khi thành công)

### Lấy danh sách slot trống theo floor (cho booking có sẵn)

- **GET** `/api/keeper/parking-slot/floors/floor/parking-slots?FloorId={floorId}&StartTime={startTime}&EndTime={endTime}&VehicleId={vehicleId}`
- **Auth:** Keeper
- **Description:** Lấy danh sách slot trống trên một floor để đặt chỗ
- **Query Parameters:**
  - `FloorId`: ID của floor
  - `StartTime`: Thời gian bắt đầu (format: yyyy-MM-ddTHH:mm:ss)
  - `EndTime`: Thời gian kết thúc (format: yyyy-MM-ddTHH:mm:ss)
  - `VehicleId`: ID loại xe
- **Response:** Danh sách slot trống

### Lấy danh sách slot trống theo floor (cho passerby - khách vãng lai)

- **GET** `/api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby?FloorId={floorId}&StartTime={startTime}&EndTime={endTime}&VehicleId={vehicleId}`
- **Auth:** Keeper
- **Description:** Lấy danh sách slot trống trên một floor để đặt chỗ cho khách vãng lai
- **Query Parameters:**
  - `FloorId`: ID của floor
  - `StartTime`: Thời gian bắt đầu (format: yyyy-MM-ddTHH:mm:ss)
  - `EndTime`: Thời gian kết thúc (format: yyyy-MM-ddTHH:mm:ss)
  - `VehicleId`: ID loại xe
- **Response:** Danh sách slot trống

### Vô hiệu hóa slot

- **POST** `/api/keeper/parking-slot/disable`
- **Auth:** Keeper
- **Description:** Vô hiệu hóa một slot (tạm thời không sử dụng được)
- **Request Body:**
  ```json
  {
    "parkingSlotId": 1,
    "reason": "Slot bị hỏng"
  }
  ```
- **Response:** `204 No Content` (khi thành công)

### Kích hoạt slot

- **PUT** `/api/keeper/parking-slot/enable`
- **Auth:** Keeper
- **Description:** Kích hoạt lại một slot đã bị vô hiệu hóa
- **Request Body:**
  ```json
  {
    "parkingSlotId": 1
  }
  ```
- **Response:** `204 No Content` (khi thành công)

---

## 📅 3. BOOKING MANAGEMENT (`/api/booking-management-for-keeper`)

### Tạo booking cho khách vãng lai (Passerby)

- **POST** `/api/booking-management-for-keeper/create/passerby`
- **Auth:** Keeper
- **Description:** Tạo booking cho khách không có tài khoản (vãng lai)
- **SignalR:** `KeeperCreateBookingForPasserby`
- **Request Body:**
  ```json
  {
    "parkingSlotId": 1,
    "vehicleId": 2,
    "startTime": "2024-01-15T08:00:00",
    "endTime": "2024-01-15T18:00:00",
    "guestName": "Nguyễn Văn A",
    "guestPhone": "0901234567",
    "guestLicensePlate": "30A-12345"
  }
  ```
- **Response:** `{ "data": bookingId, "success": true }`

### Tìm kiếm booking theo từ khóa

- **GET** `/api/booking-management-for-keeper/keeper/{keeperId}?searchString={searchString}`
- **Auth:** Keeper (require [Authorize(Roles = "Keeper")])
- **Description:** Tìm kiếm booking theo tên, số điện thoại, biển số xe
- **Path Parameters:**
  - `keeperId`: ID của keeper
- **Query Parameters:**
  - `searchString`: Từ khóa tìm kiếm
- **Response:** Danh sách booking tìm được

### Lấy tất cả booking của Keeper

- **GET** `/api/booking-management-for-keeper/{keeperId}/parkings?pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Keeper (require [Authorize(Roles = "Keeper")])
- **Description:** Lấy danh sách tất cả booking của keeper (theo parking của keeper)
- **Path Parameters:**
  - `keeperId`: ID của keeper
- **Query Parameters:**
  - `pageNo`: Số trang
  - `pageSize`: Số lượng phần tử mỗi trang
- **Response:** Danh sách booking có phân trang

### Lọc booking theo ngày và trạng thái

- **GET** `/api/booking-management-for-keeper/filters/{keeperId}/parkings?date={date}&status={status}&pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Keeper (require [Authorize(Roles = "Keeper")])
- **Description:** Lọc booking theo ngày và trạng thái
- **Path Parameters:**
  - `keeperId`: ID của keeper
- **Query Parameters:**
  - `date`: Ngày cần lọc (format: yyyy-MM-dd, optional)
  - `status`: Trạng thái booking (optional)
  - `pageNo`: Số trang
  - `pageSize`: Số lượng phần tử mỗi trang
- **Response:** Danh sách booking đã lọc

---

## ⚠️ 4. CONFLICT REQUEST MANAGEMENT (`/api/conflict-request`)

### Lấy danh sách conflict request của Keeper

- **GET** `/api/conflict-request/keeper/{keeperId}?pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Keeper
- **Description:** Lấy danh sách các yêu cầu giải quyết xung đột của keeper
- **Path Parameters:**
  - `keeperId`: ID của keeper
- **Query Parameters:**
  - `pageNo`: Số trang
  - `pageSize`: Số lượng phần tử mỗi trang
- **Response:** Danh sách conflict request

---

## ℹ️ 5. BOOKING INFORMATION (`/api/keeper/booking-Infomation`)

### Lấy thông tin chi tiết booking

- **GET** `/api/keeper/booking-Infomation?bookingId={bookingId}`
- **Auth:** Keeper
- **Description:** Lấy thông tin chi tiết của một booking
- **Query Parameters:**
  - `bookingId`: ID của booking
- **Response:** Thông tin chi tiết booking

---

## 👤 6. ACCOUNT MANAGEMENT (`/api/keeper-account-management`)

### Lấy thông tin tài khoản Keeper (có thông tin Parking)

- **GET** `/api/keeper-account-management/{userId}`
- **Auth:** Keeper, Manager (require [Authorize(Roles = "Manager,Keeper")])
- **Description:** Lấy thông tin chi tiết tài khoản keeper, **bao gồm thông tin bãi đỗ được gán**
- **Path Parameters:**
  - `userId`: ID của user (keeper) - có thể lấy từ JWT token (decode claim `_id`)
- **Response:**
  ```json
  {
    "data": {
      "userId": 5,
      "name": "Trần Văn Keeper",
      "email": "keeper1@parkz.com",
      "phone": "0901234567",
      "avatar": "https://...",
      "dateOfBirth": "1990-06-20",
      "gender": "Male",
      "isActive": true,
      "roleName": "Keeper",
      "parkingId": 1, // ← ID bãi đỗ được gán
      "parkingName": "Bãi đỗ xe ABC" // ← Tên bãi đỗ
    },
    "success": true,
    "message": "Thành công"
  }
  ```
- **Cách sử dụng:**
  1. Sau khi login, decode JWT token để lấy `userId` (claim `_id`)
  2. Gọi API này với `userId` để lấy thông tin keeper và parking
  3. Response sẽ chứa `parkingId` và `parkingName` của bãi đỗ được gán

---

## 📊 TÓM TẮT

### **Tổng số API:** **13 endpoints**

### **Phân loại theo chức năng:**

1. **Authentication:** 1 endpoint (dùng chung với Manager)
2. **Parking Slot Management:** 6 endpoints
   - Đổi slot (2)
   - Lấy danh sách slot (2)
   - Enable/Disable slot (2)
3. **Booking Management:** 4 endpoints
   - Tạo booking cho passerby (1)
   - Tìm kiếm booking (1)
   - Lấy danh sách booking (1)
   - Lọc booking (1)
4. **Conflict Request:** 1 endpoint
5. **Booking Information:** 1 endpoint
6. **Account Management:** 1 endpoint (shared với Manager)

---

## 🔐 AUTHORIZATION

Tất cả API (trừ Login) đều yêu cầu:

- **Header:** `Authorization: Bearer {token}`
- **Role:** `Keeper` (một số API cho phép `Manager,Keeper`)

---

## 📌 CHỨC NĂNG CHÍNH CỦA KEEPER

### **1. Quản lý Slot**

- Xem danh sách slot trống
- Đổi slot cho khách
- Đổi slot khi khách đến sớm
- Vô hiệu hóa/Kích hoạt slot

### **2. Quản lý Booking**

- Tạo booking cho khách vãng lai (không có tài khoản)
- Xem danh sách booking
- Tìm kiếm booking
- Lọc booking theo ngày và trạng thái
- Xem thông tin chi tiết booking

### **3. Quản lý Conflict Request**

- Xem danh sách yêu cầu giải quyết xung đột

### **4. Quản lý Tài khoản**

- Xem thông tin tài khoản của mình
- **Xem bãi đỗ được gán** (ParkingId và ParkingName)

---

## 🎯 QUAN TRỌNG

### **Keeper có thể:**

- ✅ Tạo booking cho khách vãng lai (passerby)
- ✅ Đổi slot cho khách
- ✅ Quản lý trạng thái slot (enable/disable)
- ✅ Xem và tìm kiếm booking
- ✅ Xem conflict request
- ✅ **Xem bãi đỗ được gán** (qua API Account Management)

### **Keeper KHÔNG thể:**

- ❌ Tạo parking (chỉ Manager)
- ❌ Duyệt booking request (chỉ Manager)
- ❌ Quản lý keeper khác (chỉ Manager)
- ❌ Xem thống kê doanh thu (chỉ Manager)

---

## 📝 GHI CHÚ

1. **Authentication Flow:**

   - Keeper dùng endpoint login của Manager: `/api/business-manager-authentication`
   - Keeper phải có `IsActive = true` và `IsCensorship = true`
   - **QUAN TRỌNG:** Keeper **PHẢI** được gán vào một bãi đỗ (`ParkingId` không được null)
   - **Bãi đỗ phải đã được tạo sẵn** trong hệ thống và phải tồn tại trong database
   - Parking của keeper phải `IsAvailable = true` (nếu `false` → không đăng nhập được)
   - **Flow bắt buộc:** Manager tạo Parking trước → Manager tạo Keeper và gán `ParkingId` → Keeper mới đăng nhập được

2. **Booking Flow:**

   - Keeper có thể tạo booking cho khách vãng lai (passerby)
   - Booking được tạo sẽ có trạng thái chờ duyệt hoặc đã duyệt (tùy cấu hình)

3. **Slot Management:**

   - Keeper có thể đổi slot cho khách nếu cần
   - Có thể vô hiệu hóa slot tạm thời (ví dụ: slot bị hỏng)

4. **SignalR Events:**

   - `KeeperCreateBookingForPasserby`: Trigger khi keeper tạo booking cho passerby

5. **Lấy thông tin Bãi đỗ:**
   - Keeper có thể xem bãi đỗ được gán qua API: `GET /api/keeper-account-management/{userId}`
   - Response chứa `parkingId` và `parkingName`
   - `userId` lấy từ JWT token (decode claim `_id`) sau khi login

---

## 🚀 API ENDPOINTS SUMMARY TABLE

| Module       | Endpoint Pattern                       | Count | Key Features                                         |
| ------------ | -------------------------------------- | ----- | ---------------------------------------------------- |
| Auth         | `/api/business-manager-authentication` | 1     | Login (shared với Manager)                           |
| Parking Slot | `/api/keeper/parking-slot/*`           | 6     | Change slot, Get available slots, Enable/Disable     |
| Booking      | `/api/booking-management-for-keeper/*` | 4     | Create passerby booking, Search, List, Filter        |
| Conflict     | `/api/conflict-request/keeper/*`       | 1     | View conflict requests                               |
| Booking Info | `/api/keeper/booking-Infomation`       | 1     | Get booking details                                  |
| Account      | `/api/keeper-account-management/*`     | 1     | Get account info + Parking info (shared với Manager) |

**Tổng:** **13 endpoints**

---

## 📱 UI SUGGESTIONS

### **Màn hình cần có:**

1. **Login Screen** - Đăng nhập
2. **Home Screen** - Dashboard với thống kê nhanh
3. **Slot Management** - Quản lý slot
   - Danh sách slot theo floor
   - Enable/Disable slot
4. **Booking Management** - Quản lý booking
   - Danh sách booking (có search & filter)
   - Chi tiết booking
   - Tạo booking cho passerby
5. **Conflict Request** - Danh sách conflict request
6. **Profile** - Thông tin tài khoản

### **Features cần implement:**

- ✅ Search booking theo tên, SĐT, biển số
- ✅ Filter booking theo ngày và trạng thái
- ✅ Tạo booking nhanh cho khách vãng lai
- ✅ Đổi slot với UI trực quan (chọn slot mới)
- ✅ Real-time update với SignalR
- ✅ Mobile-first design (Keeper thường dùng mobile)
