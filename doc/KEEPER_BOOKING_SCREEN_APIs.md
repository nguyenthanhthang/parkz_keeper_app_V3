# KEEPER BOOKING SCREEN - REQUIRED APIs

Mục tiêu: Liệt kê các API Keeper cần để xây UI quản lý đặt chỗ tại bãi.

---

## 1) Danh sách/Tra cứu Booking

- Danh sách booking theo Keeper (phân trang)

  - GET `/api/booking-management-for-keeper/{keeperId}/parkings?pageNo=&pageSize=`
  - Dùng cho: màn danh sách chính (list/table)
  - Params: `keeperId` (từ JWT), `pageNo`, `pageSize`

- Tìm kiếm booking theo từ khóa

  - GET `/api/booking-management-for-keeper/keeper/{keeperId}?searchString=`
  - Dùng cho: ô search (tên KH, SĐT, biển số)
  - Params: `keeperId`, `searchString`

- Lọc booking theo ngày và trạng thái

  - GET `/api/booking-management-for-keeper/filters/{keeperId}/parkings?date=&status=&pageNo=&pageSize=`
  - Dùng cho: bộ lọc (Date, Status)
  - Params: `keeperId`, `date` (yyyy-MM-dd), `status`, `pageNo`, `pageSize`

- Xem thông tin chi tiết booking
  - ✅ **KHUYẾN NGHỊ**: Dùng API Manager để xem chi tiết booking (hoạt động với mọi status)
    - GET `/api/managers/booking-management/{bookingId}`
    - Dùng cho: panel/modal chi tiết (slot, thời gian, xe, thông tin khách, thanh toán)
    - Params: `bookingId`
    - **Ưu điểm**: Hoạt động với mọi trạng thái booking (Success/Booked, Check_In, Cancel, v.v.)
  - ⚠️ **API Keeper** (`GET /api/keeper/booking-Infomation?bookingId=`) CHỈ hoạt động khi booking đã check-in
    - Chỉ dùng khi cần tính toán checkout/phí (vào sớm, ra trễ)
    - ❌ Không dùng để xem thông tin booking chưa check-in

---

## 2) Đổi/Điều phối Slot

- Lấy danh sách slot trống theo floor

  - GET `/api/keeper/parking-slot/floors/floor/parking-slots?FloorId=&StartTime=&EndTime=&VehicleId=`
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby?FloorId=&StartTime=&EndTime=&VehicleId=` (khách vãng lai)
  - Dùng cho: picker chọn slot mới khi đổi slot
  - Params: `FloorId`, `StartTime`, `EndTime`, `VehicleId`

- Đổi slot cho khách

  - PUT `/api/keeper/parking-slot/change`
  - Body: `{ "bookingId": number, "newSlotId": number }`

- Đổi slot khi khách đến sớm
  - PUT `/api/keeper/parking-slot/change/come-early`
  - Body: `{ "bookingId": number, "newSlotId": number }`

---

## 3) Quản lý tình trạng Slot (tuỳ chọn trong UI)

- Vô hiệu hóa slot

  - POST `/api/keeper/parking-slot/disable`
  - Body: `{ "parkingSlotId": number, "reason": string }`

- Kích hoạt slot
  - PUT `/api/keeper/parking-slot/enable`
  - Body: `{ "parkingSlotId": number }`

---

## 4) Tạo booking cho khách vãng lai (optional)

- Tạo booking passerby
  - POST `/api/booking-management-for-keeper/create/passerby`
  - Body: thông tin slot/thời gian/xe/khách vãng lai

---

## 5) Yêu cầu xung đột (nếu dùng)

- Danh sách conflict request
  - GET `/api/conflict-request/keeper/{keeperId}?pageNo=&pageSize=`

---

## 6) Real-time (SignalR)

- `CustomerCreateBookingSuccess`: khi customer đặt chỗ thành công
- `KeeperCreateBookingForPasserby`: khi keeper tạo booking vãng lai

Gợi ý: lắng nghe các sự kiện này để refresh danh sách.

---

## 7) Gợi ý bố cục UI

- Header: Search (searchString), Filter (Date, Status)
- List: thẻ/row booking (biển số, tên KH, giờ, slot, trạng thái)
- Detail: panel/modal dùng GET booking-Infomation, có nút Đổi slot
- Change Slot flow: mở modal → GET slots trống → chọn → PUT change/come-early
- Slot ops (tuỳ chọn): Enable/Disable slot từ trang Slot Management

---

## 8) Ghi chú

- Lấy `keeperId` từ JWT claim `_id` sau khi đăng nhập.
- Chuyển trang/refresh khi nhận SignalR để cập nhật realtime.
