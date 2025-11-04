# 🗺️ Map Implementation Guide

## Approach: Platform-Specific Maps (No API Keys Required)

### ✅ iOS: Apple Maps (Free, No API Key)
- Sử dụng `react-native-maps` với `provider={undefined}`
- Tự động dùng Apple Maps (built-in trên iOS)
- Không cần API key
- Hoạt động ngay trong Expo Go

### ✅ Android: OpenStreetMap Tiles (Free, No API Key)
- Sử dụng `react-native-maps` với custom `UrlTile`
- Load tiles từ OpenStreetMap
- Không cần API key
- Hoạt động trong Expo Go

---

## Current Implementation

### Package Dependencies
```json
{
  "react-native-maps": "1.20.1",
  "@types/react-native-maps": "^latest"
}
```

### Platform Detection
```typescript
if (Platform.OS === 'ios') {
  // Apple Maps (no provider needed)
} else {
  // Android: OpenStreetMap tiles
}
```

---

## Features

✅ **Map Picker Screen**:
- Tap to place marker
- Drag marker to move
- GPS button to get current location
- Shows coordinates (latitude/longitude)
- Confirm button to return location

✅ **No API Keys Required**:
- iOS: Apple Maps (native)
- Android: OpenStreetMap (free tiles)

---

## Future: MapLibre for Android (Optional)

Nếu muốn dùng MapLibre cho Android:
- Cần tìm package phù hợp với Expo
- Hoặc tự build native module
- Hiện tại OpenStreetMap tiles đã hoạt động tốt

**Package candidates:**
- `@rnmapbox/maps` - Cần API key
- Custom MapLibre build - Cần native code

---

## Troubleshooting

### iOS: Map không hiện
- Kiểm tra Location permission đã được cấp
- Kiểm tra device/simulator có internet
- Restart Expo server

### Android: Map không hiện
- Kiểm tra Location permission
- Kiểm tra Internet connection
- Kiểm tra OpenStreetMap tiles có load được không
- Có thể cần thử tile server khác nếu bị block

### Marker không di chuyển được
- Kiểm tra `draggable={true}` đã set
- Kiểm tra event handlers (`onDragEnd`)

---

## Alternative Tile Servers (nếu OpenStreetMap bị block)

```typescript
// Option 1: OpenStreetMap (hiện tại)
urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

// Option 2: Mapbox (cần token)
urlTemplate="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=YOUR_TOKEN"

// Option 3: Other OSM mirrors
urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
urlTemplate="https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

---

## Summary

✅ **iOS**: Apple Maps (native, no key)
✅ **Android**: OpenStreetMap tiles (free, no key)
✅ **Expo Go Compatible**: Cả 2 platform đều hoạt động trong Expo Go
✅ **No API Keys**: Không cần cấu hình API key nào cả


