# 🎯 Hướng dẫn Apply Package cho Business Profile qua Swagger

## 🔑 Bước 1: Đăng nhập Admin

1. **Tìm endpoint:** `POST /api/admin-authentication`
2. **Request body:**
   ```json
   {
     "email": "admin@parkz.com",
     "password": "admin@@"
   }
   ```
3. **Copy token từ response:**
   ```json
   {
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     },
     "success": true
   }
   ```
   Copy token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔐 Bước 2: Authorize trong Swagger

1. Click button **"Authorize"** ở góc trên bên phải
2. Nhập token (format `Bearer {token}`):
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Click **"Authorize"** và **"Close"**

---

## 📋 Bước 3: Lấy Business Profile ID

### Option 1: Qua Manager ID
1. **Endpoint:** `GET /user/{userId}/business-profile`
   - `userId` = Manager ID (ví dụ: 19)
2. **Response:**
   ```json
   {
     "data": {
       "businessProfileId": 3,
       "name": "Công ty TNHH ParkZ Việt Nam",
       ...
     }
   }
   ```
   → **Business Profile ID = 3**

### Option 2: Qua Business Profile Management
1. **Endpoint:** `GET /api/business-profile-management`
   - List tất cả business profiles
   - Tìm business profile của manager cần apply package

---

## 🎁 Bước 4: Apply Package - Các endpoint có thể

### Option 1: Manager Censorship (Khả năng cao nhất) ⭐

**Endpoint:** `PUT /api/managers/censorship/{managerId}`

**Description:** Admin approve manager và có thể apply package

**Parameters:**
- `managerId` = 19 (Manager ID)

**Request body (thử các format sau):**

**Format 1:**
```json
{
  "status": "Approved",
  "packageId": 1,
  "packageName": "Basic"
}
```

**Format 2:**
```json
{
  "isApproved": true,
  "subscriptionId": 1,
  "packageType": "Premium"
}
```

**Format 3:**
```json
{
  "censorshipStatus": "Approved",
  "subscription": {
    "packageId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

---

### Option 2: Business Profile Management

**Endpoint:** `PUT /api/business-profile-management/business-profile/{businessProfileId}`

**Parameters:**
- `businessProfileId` = 3 (từ bước 3)

**Request body:**
```json
{
  "subscriptionId": 1,
  "packageId": 1,
  "packageType": "Premium",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

---

### Option 3: Fee Management (Nếu package = fee/subscription)

**Endpoint:** `POST /api/fee-management` hoặc `PUT /api/fee-management`

**Request body:**
```json
{
  "businessProfileId": 3,
  "feeType": "Subscription",
  "amount": 0,
  "packageId": 1
}
```

---

## 🧪 Bước 5: Thực hiện Request

1. **Chọn endpoint phù hợp** (khuyến nghị: Option 1)
2. **Click "Try it out"**
3. **Nhập parameters:**
   - `managerId` = 19 (hoặc `businessProfileId` = 3)
4. **Nhập request body** (thử format ở trên)
5. **Click "Execute"**
6. **Kiểm tra response:**
   - `success: true` → ✅ Thành công
   - `message: "..."` → Kiểm tra message

---

## ✅ Bước 6: Verify

1. **Thử tạo parking trong app:**
   - Mở app → Login Manager
   - Tạo bãi đỗ mới
   - **Không còn lỗi "chưa áp dụng gói"** → ✅ Thành công

2. **Hoặc kiểm tra Business Profile:**
   - `GET /user/19/business-profile`
   - Xem có field subscription/package không

---

## 🔍 Nếu không tìm thấy đúng format

### Cách 1: Xem Schema trong Swagger

1. **Trong Swagger, click vào endpoint**
2. **Xem "Schema" hoặc "Example Value"**
3. **Copy format request body từ đó**

### Cách 2: Thử tất cả formats

1. Thử từng format một
2. Xem error message để biết format đúng
3. Điều chỉnh theo error message

### Cách 3: Kiểm tra Manager Censorship Detail

**Endpoint:** `GET /api/managers/censorship` hoặc `/api/managers/request/register-censorship`

- Xem các manager requests
- Xem có endpoint nào liên quan đến approve và apply package không

---

## 📌 Lưu ý quan trọng

⚠️ **Package ID/Type:**
- Cần biết ID package hợp lệ (1, 2, 3...)
- Hoặc package name: "Basic", "Premium", "Enterprise"...

⚠️ **Date Range (nếu có):**
- `startDate`: `yyyy-MM-dd` hoặc `yyyy-MM-ddTHH:mm:ss`
- `endDate`: `yyyy-MM-dd` hoặc `yyyy-MM-ddTHH:mm:ss`

⚠️ **Status:**
- Manager có thể cần status "Approved" trước khi apply package

---

## 🎯 Endpoint khả năng cao nhất: Manager Censorship

**Khuyến nghị thử đầu tiên:**

```
PUT /api/managers/censorship/{managerId}
```

Với:
- `managerId` = 19
- Request body với các field liên quan đến subscription/package

Xem Schema trong Swagger để biết chính xác format.

---

## 💡 Tips

1. **Xem response error:** Nếu sai format, error sẽ hướng dẫn format đúng
2. **Thử từng field một:** Bắt đầu với field cơ bản nhất
3. **Check documentation:** Xem có comment nào trong Swagger không
4. **Liên hệ backend:** Nếu không tìm được, hỏi backend team endpoint chính xác


