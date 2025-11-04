# API TẠO BÃI ĐỖ VÀ SETUP GIÁ

Tài liệu liệt kê toàn bộ API liên quan đến việc tạo bãi đỗ xe và thiết lập hệ thống giá cho Manager.

**Base URL:** `http://172.25.0.102:5178/api` hoặc `https://localhost:7071/api`

**Authentication:** Tất cả API đều yêu cầu JWT token với role `Manager`

---

## 📋 LUỒNG TẠO BÃI ĐỖ VÀ SETUP GIÁ

```
1. Tạo Parking (Bãi đỗ)
   ↓
2. Tạo Floor (Tầng)
   ↓
3. Tạo ParkingSlot (Chỗ đỗ xe)
   ↓
4. Tạo ParkingPrice (Bảng giá)
   ↓
5. Tạo Timeline (Khung giờ giá)
   ↓
6. Liên kết Parking với Price (ParkingHasPrice)
   ↓
7. Admin duyệt Parking
```

---

## 🅿️ 1. PARKING MANAGEMENT (`/api/parkings`)

### Tạo Parking mới

- **POST** `/api/parkings/parking`
- **Auth:** Manager
- **Description:** Tạo bãi đỗ xe mới
- **SignalR:** `LoadParkingInAdmin`
- **Request Body:**
  ```json
  {
    "name": "Bãi đỗ xe ABC",
    "address": "123 Đường XYZ, Quận 1, TP.HCM",
    "description": "Bãi đỗ xe gần trung tâm",
    "motoSpot": 50,
    "carSpot": 30,
    "isPrepayment": true,
    "isOvernight": true,
    "managerId": 10
  }
  ```
- **Response:** `{ "data": parkingId, "success": true }`
- **Lưu ý:** 
  - Parking được tạo với `IsActive = false` (chờ Admin duyệt)
  - `IsAvailable = false` (chưa sẵn sàng)

### Lấy danh sách Parking theo Manager

- **GET** `/api/parkings?managerId={managerId}&pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Manager, Admin
- **Description:** Lấy danh sách tất cả parking của Manager
- **Query Parameters:**
  - `managerId`: ID của Manager
  - `pageNo`: Số trang
  - `pageSize`: Số lượng phần tử mỗi trang

### Lấy chi tiết Parking

- **GET** `/api/parkings/{parkingId}`
- **Auth:** Manager, Admin
- **Description:** Lấy thông tin chi tiết của một parking

### Cập nhật thông tin Parking

- **PUT** `/api/parkings/parking/{parkingId}`
- **Auth:** Manager
- **SignalR:** `LoadParkingInAdmin`
- **Request Body:** UpdateParkingCommand (name, address, description, motoSpot, carSpot, isPrepayment, isOvernight)

### Cập nhật vị trí (Location) của Parking

- **PUT** `/api/parkings/parking/location/{parkingId}`
- **Auth:** Manager
- **SignalR:** `LoadParkingInAdmin`
- **Request Body:**
  ```json
  {
    "latitude": 10.762622,
    "longitude": 106.660172
  }
  ```

### Vô hiệu hóa/Kích hoạt Parking

- **DELETE** `/api/parkings/parking/{parkingId}`
- **Auth:** Manager
- **SignalR:** `LoadParkingInAdmin`
- **Description:** Toggle trạng thái IsAvailable của Parking

### Cập nhật trạng thái Full (Đầy chỗ)

- **PUT** `/api/parkings/parking/full/{parkingId}`
- **Auth:** Manager, Keeper
- **SignalR:** `LoadParkingInAdmin`
- **Description:** Đánh dấu parking đã đầy chỗ hoặc còn chỗ

### Vô hiệu hóa Parking theo ngày

- **PUT** `/api/parkings/disable-parking-by-date`
- **Auth:** Manager
- **Request Body:**
  ```json
  {
    "parkingId": 1,
    "startDate": "2024-11-10T00:00:00",
    "endDate": "2024-11-15T23:59:59"
  }
  ```

### Hủy lịch vô hiệu hóa đã lên lịch

- **DELETE** `/api/parkings/cancel-disable-scheduled-parking`
- **Auth:** Manager
- **Request Body:**
  ```json
  {
    "parkingId": 1,
    "jobId": "job-123"
  }
  ```

---

## 🏢 2. FLOOR MANAGEMENT (`/api/floors`)

### Tạo Floor mới

- **POST** `/api/floors/floor`
- **Auth:** Manager
- **SignalR:** `LoadFloorInManager`
- **Request Body:**
  ```json
  {
    "floorName": "Tầng 1",
    "parkingId": 1
  }
  ```
- **Response:** `{ "data": floorId, "success": true }`

### Lấy danh sách Floor

- **GET** `/api/floors?pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Manager
- **Description:** Lấy danh sách tất cả floor

### Lấy danh sách Floor theo Parking

- **GET** `/api/floors/parking/{parkingId}`
- **Auth:** Manager, Customer
- **Description:** Lấy danh sách floor của một parking cụ thể

### Cập nhật Floor

- **PUT** `/api/floors/floor/{floorId}`
- **Auth:** Manager
- **SignalR:** `LoadFloorInManager`
- **Request Body:**
  ```json
  {
    "floorName": "Tầng 1 - Đã sửa"
  }
  ```

### Vô hiệu hóa/Kích hoạt Floor

- **DELETE** `/api/floors/floor/{floorId}`
- **Auth:** Manager
- **SignalR:** `LoadFloorInManager`

---

## 🚗 3. PARKING SLOT MANAGEMENT (`/api/parkingSlot`)

### Tạo ParkingSlot (Tạo nhiều slot cùng lúc)

- **POST** `/api/parkingSlot/create`
- **Auth:** Manager
- **SignalR:** `LoadParkingSlot`
- **Request Body:**
  ```json
  {
    "floorId": 1,
    "trafficId": 2,
    "slots": [
      {
        "name": "A1",
        "rowIndex": 1,
        "columnIndex": 1
      },
      {
        "name": "A2",
        "rowIndex": 1,
        "columnIndex": 2
      }
    ]
  }
  ```
- **Description:** Tạo nhiều slot cùng lúc cho một floor

### Lấy danh sách Slot theo Floor

- **GET** `/api/parkingSlot/floor/{floorId}`
- **Auth:** Manager
- **Description:** Lấy danh sách tất cả slot của một floor

### Cập nhật Slot

- **PUT** `/api/parkingSlot`
- **Auth:** Manager
- **SignalR:** `LoadParkingSlot`
- **Request Body:**
  ```json
  {
    "parkingSlotId": 1,
    "name": "A1-Updated",
    "rowIndex": 1,
    "columnIndex": 1
  }
  ```

---

## 💰 4. PARKING PRICE MANAGEMENT (`/api/parking-price`)

### Tạo ParkingPrice (Bảng giá)

- **POST** `/api/parking-price/create`
- **Auth:** Manager
- **SignalR:** `LoadParkingPrice`
- **Request Body:**
  ```json
  {
    "parkingPriceName": "Giá theo giờ - Xe máy",
    "managerId": 10,
    "trafficId": 2,
    "isWholeDay": false,
    "startingTime": 0,
    "hasPenaltyPrice": true,
    "penaltyPrice": 5000,
    "penaltyPriceStepTime": 15,
    "isExtrafee": true,
    "extraTimeStep": 15
  }
  ```
- **Description:** Tạo bảng giá cho một loại xe (Traffic)
- **Fields:**
  - `parkingPriceName`: Tên bảng giá
  - `trafficId`: ID loại xe (1 = Ô tô, 2 = Xe máy)
  - `isWholeDay`: true = giá cả ngày, false = giá theo giờ
  - `startingTime`: Giờ bắt đầu tính giá (0-23)
  - `hasPenaltyPrice`: Có phí phạt không
  - `penaltyPrice`: Giá phạt
  - `penaltyPriceStepTime`: Bước thời gian phạt (phút)
  - `isExtrafee`: Có phụ phí vào sớm không
  - `extraTimeStep`: Bước thời gian phụ phí (phút)

### Lấy danh sách ParkingPrice

- **GET** `/api/parking-price?managerId={managerId}`
- **Auth:** Manager
- **Description:** Lấy danh sách tất cả bảng giá của Manager

### Vô hiệu hóa/Kích hoạt ParkingPrice

- **PUT** `/api/parking-price/disable-or-enable-parking-price`
- **Auth:** Manager
- **SignalR:** `LoadParkingPrice`
- **Request Body:**
  ```json
  {
    "parkingPriceId": 1
  }
  ```

---

## ⏰ 5. TIMELINE MANAGEMENT (`/api/timeline-management`)

### Tạo Timeline (Khung giờ giá)

- **POST** `/api/timeline-management`
- **Auth:** Manager
- **SignalR:** `LoadTimelineInManager`
- **Request Body:**
  ```json
  {
    "name": "Giờ cao điểm",
    "price": 10000,
    "description": "Giá cao điểm 7h-9h",
    "startTime": "07:00",
    "endTime": "09:00",
    "extraFee": 5000,
    "parkingPriceId": 1
  }
  ```
- **Description:** Tạo khung giờ giá cho một ParkingPrice
- **Fields:**
  - `startTime`: Giờ bắt đầu (format: "HH:mm")
  - `endTime`: Giờ kết thúc (format: "HH:mm")
  - `price`: Giá trong khung giờ này
  - `extraFee`: Phụ phí (nếu có)
  - `parkingPriceId`: ID của ParkingPrice

### Lấy danh sách Timeline theo ParkingPrice

- **GET** `/api/timeline-management/{parkingPriceId}?pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Manager, Admin, Staff
- **Description:** Lấy danh sách khung giờ giá của một ParkingPrice

### Cập nhật Timeline

- **PUT** `/api/timeline-management/{timelineId}`
- **Auth:** Manager
- **SignalR:** `LoadTimelineInManager`
- **Request Body:**
  ```json
  {
    "name": "Giờ cao điểm - Updated",
    "price": 12000,
    "startTime": "07:00",
    "endTime": "09:00",
    "extraFee": 5000
  }
  ```

### Vô hiệu hóa/Kích hoạt Timeline

- **DELETE** `/api/timeline-management/{timelineId}`
- **Auth:** Manager
- **SignalR:** `LoadTimelineInManager`

---

## 🔗 6. PARKING HAS PRICE (`/api/parkingHasPrice`)

### Liên kết Parking với ParkingPrice

- **POST** `/api/parkingHasPrice`
- **Auth:** Manager
- **SignalR:** `LoadParkingHasPrice`
- **Request Body:**
  ```json
  {
    "parkingId": 1,
    "parkingPriceId": 1
  }
  ```
- **Description:** Gán bảng giá cho bãi đỗ xe

### Lấy danh sách ParkingHasPrice

- **GET** `/api/parkingHasPrice/getlistparkinghasprice?parkingId={parkingId}&pageNo={pageNo}&pageSize={pageSize}`
- **Auth:** Manager
- **Description:** Lấy danh sách bảng giá đã gán cho một parking

### Lấy chi tiết ParkingHasPrice

- **GET** `/api/parkingHasPrice/detail/{id}`
- **Auth:** Manager
- **Description:** Lấy thông tin chi tiết một ParkingHasPrice

### Cập nhật ParkingHasPrice

- **PUT** `/api/parkingHasPrice`
- **Auth:** Manager
- **SignalR:** `LoadParkingHasPrice`
- **Request Body:**
  ```json
  {
    "parkingHasPriceId": 1,
    "parkingId": 1,
    "parkingPriceId": 2
  }
  ```

### Xóa ParkingHasPrice

- **DELETE** `/api/parkingHasPrice?id={parkingHasPriceId}`
- **Auth:** Manager
- **SignalR:** `LoadParkingHasPrice`

### Xóa ParkingHasPrice (Version 2)

- **DELETE** `/api/parkingHasPrice/v2/{parkingId}/{parkingPriceId}`
- **Auth:** Manager
- **SignalR:** `LoadParkingHasPrice`
- **Description:** Xóa liên kết giữa Parking và ParkingPrice

---

## 📦 7. PACKAGE PRICE MANAGEMENT (`/api/package-price`) ⚠️ COMMENTED OUT

**Lưu ý:** Controller này đã bị comment out trong code, có thể chưa được sử dụng hoặc đang phát triển.

- **POST** `/api/package-price` - Tạo Package Price
- **PUT** `/api/package-price/{packagePriceId}` - Cập nhật Package Price
- **DELETE** `/api/package-price/{packagePriceId}` - Vô hiệu hóa/Kích hoạt
- **GET** `/api/package-price/{packagePriceId}` - Lấy chi tiết Package Price

---

## 📊 TÓM TẮT LUỒNG SETUP ĐẦY ĐỦ

### **Bước 1: Tạo Parking**
```
POST /api/parkings/parking
→ Nhận parkingId
```

### **Bước 2: Tạo Floor**
```
POST /api/floors/floor
{
  "floorName": "Tầng 1",
  "parkingId": {parkingId}
}
→ Nhận floorId
```

### **Bước 3: Tạo ParkingSlot**
```
POST /api/parkingSlot/create
{
  "floorId": {floorId},
  "trafficId": 2,
  "slots": [...]
}
→ Tạo nhiều slot cho floor
```

### **Bước 4: Tạo ParkingPrice**
```
POST /api/parking-price/create
{
  "parkingPriceName": "Giá theo giờ - Xe máy",
  "managerId": {managerId},
  "trafficId": 2,
  "isWholeDay": false,
  ...
}
→ Nhận parkingPriceId
```

### **Bước 5: Tạo Timeline (Khung giờ giá)**
```
POST /api/timeline-management
{
  "parkingPriceId": {parkingPriceId},
  "startTime": "07:00",
  "endTime": "09:00",
  "price": 10000
}
→ Nhận timelineId
```

### **Bước 6: Liên kết Parking với Price**
```
POST /api/parkingHasPrice
{
  "parkingId": {parkingId},
  "parkingPriceId": {parkingPriceId}
}
```

### **Bước 7: Admin duyệt Parking**
```
PUT /api/approve-parkings/request/accept
{
  "parkingId": {parkingId}
}
→ Parking.IsActive = true, IsAvailable = true
```

---

## 📝 VÍ DỤ THỰC TẾ

### **Ví dụ: Tạo bãi đỗ xe máy và ô tô**

1. **Tạo Parking:**
   ```json
   POST /api/parkings/parking
   {
     "name": "Bãi đỗ Trung tâm",
     "address": "123 Nguyễn Huệ",
     "motoSpot": 50,
     "carSpot": 30,
     "managerId": 10
   }
   → parkingId = 1
   ```

2. **Tạo Floor:**
   ```json
   POST /api/floors/floor
   {
     "floorName": "Tầng 1",
     "parkingId": 1
   }
   → floorId = 1
   ```

3. **Tạo Slots cho Xe máy:**
   ```json
   POST /api/parkingSlot/create
   {
     "floorId": 1,
     "trafficId": 2,
     "slots": [{"name": "M1", "rowIndex": 1, "columnIndex": 1}, ...]
   }
   ```

4. **Tạo ParkingPrice cho Xe máy:**
   ```json
   POST /api/parking-price/create
   {
     "parkingPriceName": "Giá theo giờ - Xe máy",
     "managerId": 10,
     "trafficId": 2,
     "isWholeDay": false,
     "hasPenaltyPrice": true,
     "penaltyPrice": 5000
   }
   → parkingPriceId = 1
   ```

5. **Tạo Timeline:**
   ```json
   POST /api/timeline-management
   {
     "parkingPriceId": 1,
     "startTime": "00:00",
     "endTime": "06:00",
     "price": 5000
   }
   ```

6. **Liên kết:**
   ```json
   POST /api/parkingHasPrice
   {
     "parkingId": 1,
     "parkingPriceId": 1
   }
   ```

---

## 🔐 AUTHORIZATION

Tất cả API đều yêu cầu:
- **Header:** `Authorization: Bearer {token}`
- **Role:** `Manager` (một số API cho phép `Manager,Admin` hoặc `Manager,Keeper`)

---

## 📌 QUAN TRỌNG

### **Điều kiện tạo Parking:**

1. ✅ Manager phải có **BusinessProfile**
2. ✅ BusinessProfile phải có **FeeId** (đã đăng ký gói)
3. ✅ Gói "Tư nhân" chỉ được tạo tối đa 1 Parking
4. ✅ Gói "Doanh nghiệp" có thể tạo nhiều Parking

### **Sau khi tạo Parking:**

- Parking sẽ có `IsActive = false` (chờ Admin duyệt)
- Cần Admin duyệt qua API: `PUT /api/approve-parkings/request/accept`
- Sau khi duyệt: `IsActive = true`, `IsAvailable = true`

---

## 🎯 SIGNALR EVENTS

- `LoadParkingInAdmin` - Khi có thay đổi Parking
- `LoadFloorInManager` - Khi có thay đổi Floor
- `LoadParkingSlot` - Khi có thay đổi Slot
- `LoadParkingPrice` - Khi có thay đổi ParkingPrice
- `LoadTimelineInManager` - Khi có thay đổi Timeline
- `LoadParkingHasPrice` - Khi có thay đổi ParkingHasPrice

---

## 📋 CHECKLIST SETUP BÃI ĐỖ

- [ ] Tạo Parking
- [ ] Tạo ít nhất 1 Floor
- [ ] Tạo ParkingSlot cho mỗi Floor
- [ ] Tạo ParkingPrice (cho từng loại xe: Moto, Car)
- [ ] Tạo Timeline cho mỗi ParkingPrice (khung giờ giá)
- [ ] Liên kết Parking với ParkingPrice (ParkingHasPrice)
- [ ] Chờ Admin duyệt Parking
- [ ] Tạo Keeper và gán vào Parking

---

## 🚀 API ENDPOINTS SUMMARY

| Module | Endpoint Pattern | Count | Key Features |
|--------|-----------------|-------|--------------|
| Parking | `/api/parkings/*` | 10+ | Create, Update, Get, Disable |
| Floor | `/api/floors/*` | 5 | Create, Update, Get, Disable |
| Slot | `/api/parkingSlot/*` | 3 | Create, Update, Get |
| ParkingPrice | `/api/parking-price/*` | 3 | Create, Get, Disable |
| Timeline | `/api/timeline-management/*` | 4 | Create, Update, Get, Disable |
| ParkingHasPrice | `/api/parkingHasPrice/*` | 5 | Create, Update, Get, Delete |

**Tổng:** ~30+ endpoints cho việc setup bãi đỗ và giá

