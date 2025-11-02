# API TẠO BÃI ĐỖ XE (PARKING)

## 📋 THÔNG TIN API

- **Endpoint**: `POST /api/parkings/parking`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Role `Manager` only
- **Content-Type**: `application/json`

---

## 📝 REQUEST BODY

### Tất cả các fields cần thiết:

```json
{
  "name": "string (required, max 50 chars)",
  "address": "string (required, max 250 chars)",
  "description": "string (required, max 250 chars)",
  "motoSpot": "number (required, >= 0)",
  "carSpot": "number (required, >= 0)",
  "isPrepayment": "boolean (required)",
  "isOvernight": "boolean (required)",
  "managerId": "number (required)"
}
```

---

## 🔍 CHI TIẾT TỪNG FIELD

### 1. **name** (Tên bãi xe)
- **Type**: `string`
- **Required**: ✅ Bắt buộc
- **Max Length**: 50 ký tự
- **Validation**: 
  - Không được để trống
  - Không được null
  - Không được trùng với tên bãi xe đã tồn tại
- **Example**: `"Bãi đỗ xe Trung tâm TP.HCM"`

### 2. **address** (Địa chỉ)
- **Type**: `string`
- **Required**: ✅ Bắt buộc
- **Max Length**: 250 ký tự
- **Validation**: 
  - Không được để trống
  - Không được null
- **Example**: `"123 Đường Nguyễn Huệ, Quận 1, TP.HCM"`

### 3. **description** (Mô tả)
- **Type**: `string`
- **Required**: ✅ Bắt buộc
- **Max Length**: 250 ký tự
- **Validation**: 
  - Không được để trống
  - Không được null
- **Example**: `"Bãi đỗ xe rộng rãi, an toàn, có camera giám sát 24/7"`

### 4. **motoSpot** (Số slot xe máy)
- **Type**: `number` (integer)
- **Required**: ✅ Bắt buộc
- **Default**: `0` (nếu không gửi)
- **Validation**: 
  - Phải >= 0
- **Example**: `50`

### 5. **carSpot** (Số slot xe ô tô)
- **Type**: `number` (integer)
- **Required**: ✅ Bắt buộc
- **Default**: `0` (nếu không gửi)
- **Validation**: 
  - Phải >= 0
- **Example**: `30`

### 6. **isPrepayment** (Có thanh toán trả trước)
- **Type**: `boolean`
- **Required**: ✅ Bắt buộc
- **Validation**: 
  - Không được null
  - Phải là `true` hoặc `false`
- **Description**: 
  - `true`: Bãi đỗ có hỗ trợ thanh toán trả trước
  - `false`: Không hỗ trợ thanh toán trả trước
- **Example**: `true`

### 7. **isOvernight** (Có áp dụng gửi xe qua đêm)
- **Type**: `boolean`
- **Required**: ✅ Bắt buộc
- **Validation**: 
  - Không được null
  - Phải là `true` hoặc `false`
- **Description**: 
  - `true`: Cho phép gửi xe qua đêm
  - `false`: Không cho phép gửi xe qua đêm
- **Example**: `true`

### 8. **managerId** (ID của Manager)
- **Type**: `number` (integer)
- **Required**: ✅ Bắt buộc
- **Validation**: 
  - Không được null
  - Phải tồn tại trong hệ thống
  - Manager phải có BusinessProfile
- **Description**: ID của Manager sở hữu bãi đỗ này
- **Note**: Thường lấy từ JWT token sau khi login
- **Example**: `10`

---

## 📤 RESPONSE

### Success Response (201 Created)

```json
{
  "data": 123,
  "message": "Thành công",
  "success": true,
  "statusCode": 201,
  "count": 0
}
```

**Fields:**
- `data`: ParkingId (ID của bãi đỗ vừa tạo)
- `message`: "Thành công"
- `success`: `true`
- `statusCode`: `201`
- `count`: `0`

### Error Response (400 Bad Request)

#### Validation Error:

```json
{
  "message": "Validation Error: Vui lòng nhập {Tên bãi xe}. \r\n -- Name: 'Name' must not be empty.",
  "success": false,
  "statusCode": 400
}
```

#### Tên bãi xe đã tồn tại:

```json
{
  "data": 0,
  "message": "Tên bãi xe đã tồn tại. Vui lòng nhập tên bãi xe khác.",
  "success": false,
  "statusCode": 400,
  "count": 0
}
```

#### Manager không có BusinessProfile:

```json
{
  "message": "Không tìm thấy Business Profile.",
  "success": false,
  "statusCode": 404
}
```

#### Unauthorized (401):

```json
{
  "message": "Unauthorized: Access is Denied due invalid credential."
}
```

---

## 💡 VÍ DỤ REQUEST

### Example 1: Tạo bãi đỗ xe đầy đủ thông tin

```json
{
  "name": "Bãi đỗ xe Trung tâm Quận 1",
  "address": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
  "description": "Bãi đỗ xe rộng rãi, có mái che, camera giám sát 24/7, có nhân viên trực",
  "motoSpot": 100,
  "carSpot": 50,
  "isPrepayment": true,
  "isOvernight": true,
  "managerId": 10
}
```

### Example 2: Bãi đỗ chỉ có xe máy

```json
{
  "name": "Bãi đỗ xe máy Gần chợ Bến Thành",
  "address": "456 Đường Lê Lợi, Quận 1, TP.HCM",
  "description": "Bãi đỗ xe máy gần chợ, tiện lợi",
  "motoSpot": 200,
  "carSpot": 0,
  "isPrepayment": false,
  "isOvernight": false,
  "managerId": 10
}
```

### Example 3: Bãi đỗ chỉ có ô tô

```json
{
  "name": "Bãi đỗ xe ô tô cao cấp",
  "address": "789 Đường Pasteur, Quận 3, TP.HCM",
  "description": "Bãi đỗ xe ô tô cao cấp, có thang máy, bảo vệ 24/7",
  "motoSpot": 0,
  "carSpot": 80,
  "isPrepayment": true,
  "isOvernight": true,
  "managerId": 10
}
```

---

## 🔐 HEADERS

```http
POST /api/parkings/parking HTTP/1.1
Host: 172.25.0.102:5178
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 📝 LƯU Ý QUAN TRỌNG

### 1. **Business Logic**
- Bãi đỗ sau khi tạo sẽ có:
  - `IsActive = false` (Chưa kích hoạt - cần approve)
  - `IsFull = false`
  - `IsAvailable = false`
  - `Code = "BX" + ParkingId` (auto-generated)
  - `Stars = 0.0`
- Bãi đỗ sẽ được liên kết với `BusinessProfile` của Manager

### 2. **Validation Rules**
- Tên bãi xe phải **unique** (không trùng với bãi đỗ khác)
- Manager phải có `BusinessProfile` đã được tạo trước
- Tổng số slot (`motoSpot + carSpot`) có thể = 0, nhưng không được âm

### 3. **ManagerId**
- `ManagerId` thường được lấy từ JWT token (claim `_id`)
- Có thể gửi trong request body hoặc lấy từ token (tùy implementation)

### 4. **SignalR**
- Sau khi tạo thành công, sẽ trigger SignalR event: `LoadParkingInAdmin`
- Frontend cần listen event này để update danh sách bãi đỗ real-time

---

## 🧪 CURL EXAMPLE

```bash
curl -X POST "http://172.25.0.102:5178/api/parkings/parking" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bãi đỗ xe Trung tâm",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "description": "Bãi đỗ xe rộng rãi",
    "motoSpot": 100,
    "carSpot": 50,
    "isPrepayment": true,
    "isOvernight": true,
    "managerId": 10
  }'
```

---

## 📋 CHECKLIST KHI TẠO BÃI ĐỖ

Trước khi gọi API, đảm bảo:
- [ ] Manager đã login và có JWT token hợp lệ
- [ ] Manager đã có BusinessProfile được tạo
- [ ] Tên bãi xe chưa tồn tại trong hệ thống
- [ ] Tất cả các field required đã điền đầy đủ
- [ ] `motoSpot` và `carSpot` >= 0
- [ ] `isPrepayment` và `isOvernight` là boolean (true/false)

---

## 🔄 FLOW TẠO BÃI ĐỖ

1. **Manager Login** → Lấy JWT token
2. **Kiểm tra BusinessProfile** → Đảm bảo Manager đã có BusinessProfile
3. **Fill Form** → Nhập đầy đủ thông tin
4. **Call API** → `POST /api/parkings/parking`
5. **Response** → Nhận `ParkingId` nếu thành công
6. **SignalR** → Nhận event `LoadParkingInAdmin` để update UI

---

## ⚠️ CÁC LỖI THƯỜNG GẶP

### 1. Validation Error
- **Nguyên nhân**: Thiếu field hoặc format sai
- **Giải pháp**: Kiểm tra lại tất cả fields required

### 2. "Tên bãi xe đã tồn tại"
- **Nguyên nhân**: Tên bãi xe đã có trong hệ thống
- **Giải pháp**: Đổi tên bãi xe khác

### 3. "Không tìm thấy Business Profile"
- **Nguyên nhân**: Manager chưa tạo BusinessProfile
- **Giải pháp**: Tạo BusinessProfile trước khi tạo bãi đỗ

### 4. 401 Unauthorized
- **Nguyên nhân**: Token hết hạn hoặc không hợp lệ
- **Giải pháp**: Login lại để lấy token mới

### 5. 403 Forbidden
- **Nguyên nhân**: User không phải Manager
- **Giải pháp**: Đảm bảo user có role "Manager"

---

## 📚 RELATED APIs

Sau khi tạo bãi đỗ thành công, có thể cần:

1. **Tạo Floor (Tầng)**
   - `POST /api/floors/floor`
   - Cần `parkingId` từ response

2. **Tạo Slot**
   - `POST /api/parkingSlot/create`
   - Cần `floorId` và `parkingId`

3. **Gán Giá**
   - `POST /api/parkingHasPrice`
   - Cần `parkingId` và `parkingPriceId`

4. **Thêm Hình ảnh**
   - `POST /api/parking-spot-image`
   - Cần `parkingId`

5. **Cập nhật Location** (Latitude, Longitude)
   - `PUT /api/parkings/parking/location/{parkingId}`

---

## 🎯 UI FORM DESIGN SUGGESTION

### Form Fields Layout:

```
┌─────────────────────────────────┐
│  TẠO BÃI ĐỖ XE MỚI              │
├─────────────────────────────────┤
│                                 │
│  [Tên bãi xe *]                 │
│  ┌───────────────────────────┐ │
│  │ Bãi đỗ xe...              │ │
│  └───────────────────────────┘ │
│  (Max 50 ký tự)                 │
│                                 │
│  [Địa chỉ *]                    │
│  ┌───────────────────────────┐ │
│  │ 123 Đường ABC...         │ │
│  └───────────────────────────┘ │
│  (Max 250 ký tự)                │
│                                 │
│  [Mô tả *]                      │
│  ┌───────────────────────────┐ │
│  │ Bãi đỗ xe rộng rãi...     │ │
│  │                            │ │
│  └───────────────────────────┘ │
│  (Max 250 ký tự)                │
│                                 │
│  [Số Slot]                      │
│  ┌─────────┐  ┌─────────┐      │
│  │ Xe máy  │  │ Ô tô    │      │
│  │ [100]   │  │ [50]    │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  [Tính năng]                    │
│  ☑ Thanh toán trả trước         │
│  ☑ Gửi xe qua đêm               │
│                                 │
│  [Cancel]  [Tạo Bãi Đỗ]         │
└─────────────────────────────────┘
```

---

## 📝 SUMMARY

**API**: `POST /api/parkings/parking`

**Required Fields (8 fields):**
1. ✅ `name` - Tên bãi xe (max 50 chars, unique)
2. ✅ `address` - Địa chỉ (max 250 chars)
3. ✅ `description` - Mô tả (max 250 chars)
4. ✅ `motoSpot` - Số slot xe máy (>= 0)
5. ✅ `carSpot` - Số slot ô tô (>= 0)
6. ✅ `isPrepayment` - Có thanh toán trả trước (boolean)
7. ✅ `isOvernight` - Có gửi xe qua đêm (boolean)
8. ✅ `managerId` - ID Manager (phải có BusinessProfile)

**Response**: `ParkingId` (integer)

**SignalR Event**: `LoadParkingInAdmin`

