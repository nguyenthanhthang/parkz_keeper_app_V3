# 📋 Hướng dẫn đăng ký gói cho Business Profile qua Swagger UI

## 🎯 Mục tiêu

Đăng ký subscription package cho Business Profile thông qua Swagger UI (vì chưa có Admin UI).

---

## 🔑 Bước 1: Đăng nhập Admin trong Swagger

1. **Mở Swagger UI:**
   ```
   http://103.56.161.75/swagger/index.html
   ```

2. **Tìm endpoint đăng nhập Admin:**
   - Tìm controller: `AdminAuthentication` hoặc tương tự
   - Endpoint: `POST /api/admin-authentication` hoặc `POST /api/admin/login`

3. **Thực hiện đăng nhập:**
   ```json
   {
     "email": "admin@parkz.com",
     "password": "admin_password"
   }
   ```

4. **Copy JWT Token từ response:**
   - Response sẽ có dạng:
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": { ... }
     }
     ```
   - Copy toàn bộ token (bao gồm `Bearer ` nếu có)

---

## 🔍 Bước 2: Tìm endpoint đăng ký gói

### Các controller có thể chứa endpoint:

1. **Subscription Controller**
   - Tìm: `Subscription`, `Package`, `Plan`, `SubscriptionPackage`
   - Endpoints có thể:
     - `POST /api/subscription/apply`
     - `POST /api/package/apply`
     - `POST /api/business-profile/{id}/apply-package`
     - `POST /api/admin/subscription/apply`

2. **Business Profile Controller (Admin)**
   - Tìm: `BusinessProfileAdmin`, `AdminBusinessProfile`
   - Endpoints có thể:
     - `PUT /api/admin/business-profile/{id}/subscription`
     - `POST /api/admin/business-profile/{id}/package`

3. **Admin Controller**
   - Tìm: `Admin`, `AdminManagement`
   - Endpoints có thể:
     - `POST /api/admin/apply-package`
     - `PUT /api/admin/business-profile/subscription`

---

## 🔐 Bước 3: Authorize trong Swagger

1. **Click button "Authorize"** ở góc trên bên phải Swagger UI

2. **Nhập token:**
   - Nếu yêu cầu format `Bearer {token}`:
     ```
     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Hoặc chỉ token:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

3. **Click "Authorize"** và **"Close"**

---

## 📝 Bước 4: Lấy Business Profile ID

### Cách 1: Qua Swagger

1. **Tìm endpoint:**
   - `GET /api/business-profile/business-profile/{managerId}`
   - Hoặc `GET /api/user/{userId}/business-profile`

2. **Thực hiện request với Manager ID:**
   - Ví dụ Manager ID = 19
   - Response sẽ có `businessProfileId`

### Cách 2: Từ lỗi khi tạo parking

- Lỗi sẽ cho biết Business Profile nào chưa có gói
- Note lại Manager ID hoặc Business Profile ID

---

## 🎁 Bước 5: Apply Package

### Format request có thể:

**Option 1:**
```json
POST /api/subscription/apply
{
  "businessProfileId": 123,
  "packageId": 1,
  "packageName": "Basic"
}
```

**Option 2:**
```json
PUT /api/admin/business-profile/{businessProfileId}/subscription
{
  "packageId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Option 3:**
```json
POST /api/package/apply
{
  "managerId": 19,
  "packageType": "Premium"
}
```

---

## 🧪 Bước 6: Test

1. **Thực hiện request** trong Swagger
2. **Kiểm tra response:**
   - `success: true` → ✅ Thành công
   - `message: "..."` → Kiểm tra message
3. **Test lại tạo parking:**
   - Thử tạo parking trong app
   - Không còn lỗi "chưa áp dụng gói" → ✅ Thành công

---

## 🔍 Nếu không tìm thấy endpoint

### Các bước khắc phục:

1. **Xem tất cả controllers trong Swagger:**
   - Scroll xuống xem tất cả endpoints
   - Tìm từ khóa: `subscription`, `package`, `plan`, `gói`

2. **Kiểm tra Business Profile endpoints:**
   - Có thể có endpoint update business profile với field subscription
   - Format có thể: `PUT /api/business-profile/{id}` với body có `subscriptionId`

3. **Liên hệ backend team:**
   - Hỏi endpoint chính xác để apply package
   - Hoặc endpoint để update business profile subscription

---

## 📌 Lưu ý

⚠️ **Quan trọng:**

1. **Token Admin:**
   - Phải đăng nhập với role Admin
   - Token phải còn hạn (không expired)

2. **Business Profile ID:**
   - Cần đúng ID của business profile cần apply package
   - Có thể lấy từ Manager ID

3. **Package ID/Type:**
   - Cần biết ID hoặc tên package hợp lệ
   - Có thể cần liệt kê packages trước

4. **Date Range (nếu có):**
   - Nếu package có thời hạn, cần set `startDate` và `endDate`
   - Format thường: `yyyy-MM-dd`

---

## 🎯 Checklist

- [ ] Đăng nhập Admin trong Swagger
- [ ] Copy JWT Token
- [ ] Authorize trong Swagger
- [ ] Tìm endpoint apply package
- [ ] Lấy Business Profile ID
- [ ] Thực hiện apply package
- [ ] Kiểm tra response success
- [ ] Test tạo parking trong app

---

## 📞 Support

Nếu không tìm thấy endpoint, có thể:

1. **Xem toàn bộ Swagger:**
   - Scroll tất cả controllers
   - Search từ khóa liên quan

2. **Kiểm tra API documentation khác:**
   - Xem có file documentation nào về subscription không

3. **Liên hệ backend:**
   - Hỏi endpoint chính xác
   - Hoặc hỏi cách apply package cho business profile

---

## 💡 Alternative: Tạm thời bypass (Development only)

**⚠️ CHỈ DÙNG TRONG DEVELOPMENT - KHÔNG DÙNG PRODUCTION**

Nếu cần test nhanh, có thể:
1. Tạm thời comment validation trong backend
2. Hoặc tạo mock data với subscription đã active

**Không khuyến nghị** vì sẽ không test được flow thực tế.


