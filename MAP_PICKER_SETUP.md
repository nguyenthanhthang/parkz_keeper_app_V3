# 🗺️ Map Picker Setup Guide

## Tính năng
MapPicker cho phép user chọn vị trí bãi đỗ trên Google Maps và tự động lấy latitude/longitude.

## Cài đặt Google Maps API Key

### Bước 1: Lấy Google Maps API Key
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Maps JavaScript API**
4. Tạo API Key:
   - Vào **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Copy API Key

### Bước 2: Cấu hình API Key
Sửa file `src/components/map/MapPickerScreen.tsx`:

```typescript
// Thay thế dòng này:
src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDummyKeyForTesting&callback=initMap&libraries=places"

// Bằng API Key thật của bạn:
src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap&libraries=places"
```

### Bước 3: Restrict API Key (Khuyến nghị - Bảo mật)
1. Vào **APIs & Services** > **Credentials**
2. Click vào API Key bạn vừa tạo
3. Trong **Application restrictions**:
   - Chọn **HTTP referrers (web sites)**
   - Thêm referrers:
     - `http://localhost:*`
     - `exp://*`
     - Domain của bạn (nếu có)
4. Trong **API restrictions**:
   - Chọn **Restrict key**
   - Chọn **Maps JavaScript API**

## Cách sử dụng

1. **Trong form tạo bãi đỗ:**
   - Click button **"Chọn vị trí trên bản đồ"**
   - Map sẽ mở với vị trí hiện tại (nếu có permission)
   - Hoặc vị trí mặc định (Hồ Chí Minh City)

2. **Chọn vị trí:**
   - **Tap** trên map để đặt marker
   - **Drag** marker để di chuyển
   - Hoặc click button **GPS** để lấy vị trí hiện tại

3. **Xác nhận:**
   - Xem tọa độ hiển thị ở footer
   - Click **"Xác nhận vị trí"**
   - Latitude và Longitude sẽ tự động điền vào form

## Lưu ý

- ⚠️ Cần có **Internet connection** để load Google Maps
- ⚠️ Cần **Location permission** để lấy vị trí hiện tại
- ⚠️ **Google Maps API Key** có quota giới hạn (free tier: $200/month)
- ✅ Backend có thể tự geocode để lấy địa chỉ từ lat/lng nếu cần

## Troubleshooting

### Map không load
- Kiểm tra API Key có đúng không
- Kiểm tra đã enable **Maps JavaScript API** chưa
- Kiểm tra Internet connection

### Không lấy được vị trí hiện tại
- Kiểm tra Location permission đã được cấp chưa
- Kiểm tra GPS/Wifi đã bật chưa
