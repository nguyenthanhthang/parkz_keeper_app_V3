# 🗺️ Google Maps API Key Setup Guide

## Vấn đề
Khi click vào bản đồ trong phần tạo bãi đỗ, bị lỗi: "Trang này đã không tải google maps đúng cách"

**Nguyên nhân**: Google Maps API Key chưa được cấu hình hoặc không hợp lệ.

---

## Hướng dẫn cấu hình Google Maps API Key

### Bước 1: Lấy Google Maps API Key

1. **Truy cập Google Cloud Console**
   - Vào: https://console.cloud.google.com/
   - Đăng nhập với Google account

2. **Tạo Project mới hoặc chọn Project hiện có**
   - Click vào dropdown project ở top bar
   - Chọn "New Project" hoặc chọn project có sẵn

3. **Enable Maps JavaScript API**
   - Vào **APIs & Services** > **Library**
   - Tìm "Maps JavaScript API"
   - Click "Enable"

4. **Tạo API Key**
   - Vào **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Copy API Key (dạng: `AIzaSy...`)

---

### Bước 2: Cấu hình API Key trong Project

**Cách 1: Sử dụng Environment Variable (Khuyến nghị)**

1. Tạo file `.env` trong root project:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_api_key...
```

2. Restart Expo server:
```bash
npm run start:clear
```

**Cách 2: Hardcode trong constants.ts (Chỉ dùng cho development)**

1. Mở file `src/utils/constants.ts`
2. Tìm dòng:
```typescript
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
```

3. Thay `"YOUR_GOOGLE_MAPS_API_KEY"` bằng API Key thực tế:
```typescript
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSy...your_actual_api_key...";
```

⚠️ **Lưu ý**: Không commit API Key vào Git! Sử dụng `.env` file và thêm `.env` vào `.gitignore`.

---

### Bước 3: Restrict API Key (Bảo mật - Khuyến nghị)

1. Vào **APIs & Services** > **Credentials**
2. Click vào API Key bạn vừa tạo
3. Trong **Application restrictions**:
   - Chọn **HTTP referrers (web sites)**
   - Thêm referrers:
     - `http://localhost:*`
     - `exp://*`
     - `*://*.expo.dev/*`
     - Domain của bạn (nếu có)
4. Trong **API restrictions**:
   - Chọn **Restrict key**
   - Chọn **Maps JavaScript API**
   - (Optional) Chọn **Places API** nếu cần
5. Click **Save**

---

## Kiểm tra

1. Restart Expo server:
```bash
npm run start:clear
```

2. Mở app và thử:
   - Tạo bãi đỗ mới
   - Click "Chọn vị trí trên bản đồ"
   - Google Maps phải load được

3. Nếu vẫn lỗi:
   - Kiểm tra API Key có đúng không
   - Kiểm tra đã enable "Maps JavaScript API" chưa
   - Kiểm tra API Key có bị restrict không (thử tạm thời bỏ restrict để test)
   - Kiểm tra Internet connection

---

## Troubleshooting

### Lỗi: "This page didn't load Google Maps correctly"
- ✅ Kiểm tra API Key có đúng không
- ✅ Kiểm tra đã enable "Maps JavaScript API" chưa
- ✅ Kiểm tra API Key có bị restrict không (thử tạm thời remove restrict)
- ✅ Kiểm tra Internet connection

### Lỗi: "RefererNotAllowedMapError"
- ✅ Kiểm tra Application restrictions có đúng referrer không
- ✅ Thử thêm `*` (tất cả referrers) để test (⚠️ không dùng production)

### Lỗi: "API key not valid"
- ✅ Kiểm tra API Key có copy đầy đủ không (không thiếu ký tự)
- ✅ Kiểm tra API Key có bị xóa/recreate không
- ✅ Kiểm tra project có đúng không

---

## Chi phí

- **Free Tier**: $200 credit/tháng
- **Maps JavaScript API**: ~$7 per 1,000 requests
- **Places API**: ~$17 per 1,000 requests

Với free tier, bạn có thể load map khoảng 28,000 lần/tháng miễn phí.

---

## Tóm tắt

1. ✅ Lấy Google Maps API Key từ Google Cloud Console
2. ✅ Enable "Maps JavaScript API"
3. ✅ Cấu hình API Key trong `.env` hoặc `constants.ts`
4. ✅ Restart Expo server
5. ✅ Test lại tính năng bản đồ


