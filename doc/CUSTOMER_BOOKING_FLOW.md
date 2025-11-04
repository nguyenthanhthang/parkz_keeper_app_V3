# CUSTOMER BOOKING FLOW (Customer ↔ Keeper)

## 1) Luồng tổng quan

1. Customer đăng nhập ứng dụng (JWT)
2. Customer tìm slot trống, xem giá dự kiến theo khung giờ
3. Customer tạo booking (chọn parking/floor/slot, thời gian, phương thức thanh toán, biển số xe)
4. Hệ thống tạo booking và phát sự kiện real-time
5. Keeper nhận booking mới, xem chi tiết và xử lý tại bãi (check-in, đổi slot nếu cần)
6. Customer/ hệ thống cập nhật trạng thái thanh toán khi cần (prepaid/postpaid)

---

## 2) Customer gửi gì cho Keeper?

Thông tin booking mà Customer đã đặt (Keeper xem được qua API):
- bookingId (định danh)
- Parking (parkingId, parkingName)
- Floor/Slot (floorId, slotId)
- Thời gian: startTime, endTime
- Vehicle: vehicleId, licensePlate (nếu có)
- Phương thức/thông tin thanh toán: prepaid/postpaid/online
- Trạng thái booking: Booked/Unpaid/Paid/Cancelled…

Keeper không nhận trực tiếp request từ Customer; thay vào đó Keeper xem booking mới/tồn tại qua các API Keeper và xử lý tại bãi.

---

## 3) API chính phía Customer (Controller: `api/customer-booking`)

- Tạo booking
  - POST `/api/customer-booking`
  - Body: CreateBookingCommand (parkingId, floorId/slotId hoặc rule chọn slot, startTime, endTime, vehicleId, licensePlate, paymentMethod…)
  - SignalR: `CustomerCreateBookingSuccess`, `LoadHistoryInManager`

- Tạo booking khi đã thanh toán trước (already paid)
  - POST `/api/customer-booking/booking/prepaid-online-booking/already-paid`

- Hủy booking
  - POST `/api/customer-booking/cancel-booking`
  - Body: CancelBookingCommand { bookingId }
  - SignalR: `CustomerCreateBookingSuccess`, `LoadHistoryInManager`

- Cập nhật trạng thái “đã thanh toán”
  - PUT `/api/customer-booking/change-status-paid`

- Chọn phương thức thanh toán
  - PUT `/api/customer-booking/update-payment-method`

- Đặt cọc muộn (prepaid late)
  - POST `/api/customer-booking/prepaid-late-booking`

- Thanh toán sau online (postpaid online)
  - POST `/api/customer-booking/postpaid-online-booking`

- Lấy slot trống theo điều kiện
  - GET `/api/customer-booking/get-available-slots`
  - Query: GetAvailableSlotsQuery (parkingId/floorId, time range, vehicleId …)

- Lịch khả dụng (calendar)
  - GET `/api/customer-booking/get-available-slots-calendar`

- Chi tiết booking (đã đặt)
  - GET `/api/customer-booking/getbooked-booking-detail`
  - Query: GetBookingDetailsQuery { bookingId }

- Giá dự kiến sau khi chọn slot/khung giờ
  - GET `/api/customer-booking/get-expected-price`
  - Query: CaculateTotalPriceAfterSelectSlotCommand

- Booking sắp tới cho user
  - GET `/api/customer-booking/upcomming/{userId}`

- Lịch sử/hoạt động của user
  - GET `/api/customer-booking/activities/{userId}`

---

## 4) Keeper tiếp nhận và xử lý như thế nào?

API chính phía Keeper:

- Tạo booking cho khách vãng lai (nếu khách không đặt trước)
  - POST `/api/booking-management-for-keeper/create/passerby`
  - SignalR: `KeeperCreateBookingForPasserby`

- Tìm kiếm booking theo từ khóa (tên, SĐT, biển số…)
  - GET `/api/booking-management-for-keeper/keeper/{keeperId}?searchString={q}`

- Danh sách booking theo keeper (phân trang)
  - GET `/api/booking-management-for-keeper/{keeperId}/parkings?pageNo=&pageSize=`

- Lọc booking theo ngày/trạng thái
  - GET `/api/booking-management-for-keeper/filters/{keeperId}/parkings?date=&status=&pageNo=&pageSize=`

- Xem thông tin chi tiết booking (cho tác vụ tại bãi)
  - GET `/api/keeper/booking-Infomation?bookingId={id}`

- Lấy slot trống theo floor (để đổi slot cho khách/điều phối)
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots?FloorId=&StartTime=&EndTime=&VehicleId=`
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby?FloorId=&StartTime=&EndTime=&VehicleId=`

- Đổi slot cho khách
  - PUT `/api/keeper/parking-slot/change`

- Đổi slot khi khách đến sớm
  - PUT `/api/keeper/parking-slot/change/come-early`

- Vô hiệu hóa/Kích hoạt slot (tình huống vận hành)
  - POST `/api/keeper/parking-slot/disable`
  - PUT `/api/keeper/parking-slot/enable`

- Xem yêu cầu xung đột (nếu có)
  - GET `/api/conflict-request/keeper/{keeperId}?pageNo=&pageSize=`

---

## 5) Luồng chi tiết (theo thời điểm)

- Trước khi đặt:
  - Customer: GET available slots → GET expected price → POST create booking
  - SignalR phát sự kiện “CustomerCreateBookingSuccess” (UI Manager/Keeper có thể lắng nghe)

- Ngày đến bãi:
  - Keeper: tìm booking theo từ khóa/ danh sách → GET booking info
  - Trường hợp khách đến sớm/slot có vấn đề → Keeper GET available slots → PUT change/come-early

- Thanh toán:
  - Customer/ hệ thống: PUT change-status-paid hoặc các flow prepaid/postpaid phù hợp

- Hủy:
  - Customer: POST cancel-booking → SignalR cập nhật realtime

---

## 6) Tối thiểu các API cần cho UI Booking (Customer & Keeper)

- Customer:
  - GET `/api/customer-booking/get-available-slots`
  - GET `/api/customer-booking/get-expected-price`
  - POST `/api/customer-booking` (tạo booking)
  - GET `/api/customer-booking/getbooked-booking-detail` (chi tiết)
  - POST `/api/customer-booking/cancel-booking` (hủy)
  - (Tùy chọn) Các API thanh toán: prepaid-late, prepaid-online, postpaid-online, change-status-paid

- Keeper:
  - GET `/api/booking-management-for-keeper/{keeperId}/parkings`
  - GET `/api/booking-management-for-keeper/keeper/{keeperId}?searchString=`
  - GET `/api/booking-management-for-keeper/filters/{keeperId}/parkings`
  - GET `/api/keeper/booking-Infomation?bookingId=`
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots` (+ ver2/passerby)
  - PUT `/api/keeper/parking-slot/change` (+ change/come-early)
  - POST `/api/keeper/parking-slot/disable` / PUT `/api/keeper/parking-slot/enable`

---

## 7) SignalR events liên quan
- `CustomerCreateBookingSuccess`: Sau khi customer tạo booking thành công
- `LoadHistoryInManager`: Cập nhật lịch sử/manager UI
- `KeeperCreateBookingForPasserby`: Keeper tạo booking cho khách vãng lai

---

## 8) Ghi chú triển khai UI
- Customer: quy trình đặt chỗ gồm bước chọn parking → thời gian → slot → giá dự kiến → thanh toán → xác nhận
- Keeper: dashboard theo ngày, ô tìm kiếm nhanh, filter trạng thái/khung giờ; nhanh thao tác đổi slot/khóa slot

---

## 9) Keeper cần những API nào để xử lý booking (tóm tắt thực dụng)

- Danh sách booking theo Keeper (phân trang)
  - GET `/api/booking-management-for-keeper/{keeperId}/parkings?pageNo=&pageSize=`
  - Dùng ở: màn danh sách chính theo ngày/ca làm
  - Params: `keeperId` (từ JWT), `pageNo`, `pageSize`

- Tìm kiếm nhanh booking theo từ khóa
  - GET `/api/booking-management-for-keeper/keeper/{keeperId}?searchString={q}`
  - Dùng ở: ô search nhanh (tên, SĐT, biển số)
  - Params: `keeperId`, `searchString`

- Lọc booking theo ngày và trạng thái
  - GET `/api/booking-management-for-keeper/filters/{keeperId}/parkings?date=&status=&pageNo=&pageSize=`
  - Dùng ở: filter bar (Today, Pending/Booked/Paid/Cancelled...)
  - Params: `keeperId`, `date` (yyyy-MM-dd), `status`, `pageNo`, `pageSize`

- Xem thông tin chi tiết booking (để xử lý tại bãi)
  - GET `/api/keeper/booking-Infomation?bookingId={id}`
  - Dùng ở: modal/chi tiết bên phải để xem slot, thời gian, xe, thanh toán
  - Params: `bookingId`

- Lấy slot trống để đổi slot cho khách (điều phối)
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots?FloorId=&StartTime=&EndTime=&VehicleId=`
  - GET `/api/keeper/parking-slot/floors/floor/parking-slots/ver2/passerby?FloorId=&StartTime=&EndTime=&VehicleId=` (khi khách vãng lai)
  - Dùng ở: bước chọn slot mới khi cần đổi
  - Params: `FloorId`, `StartTime`, `EndTime`, `VehicleId`

- Đổi slot cho khách
  - PUT `/api/keeper/parking-slot/change`
  - Body (ví dụ): `{ "bookingId": 123, "newSlotId": 456 }`
  - Dùng ở: action “Đổi slot” trong chi tiết booking

- Đổi slot khi khách đến sớm
  - PUT `/api/keeper/parking-slot/change/come-early`
  - Body (ví dụ): `{ "bookingId": 123, "newSlotId": 456 }`
  - Dùng ở: flow khách đến sớm hơn giờ đặt

- Vô hiệu hóa/Kích hoạt slot (xử lý sự cố hạ tầng)
  - POST `/api/keeper/parking-slot/disable`
    - Body (ví dụ): `{ "parkingSlotId": 456, "reason": "Hỏng thiết bị" }`
  - PUT `/api/keeper/parking-slot/enable`
    - Body (ví dụ): `{ "parkingSlotId": 456 }`
  - Dùng ở: màn quản trị slot tại bãi

- Tạo booking cho khách vãng lai (nếu khách không đặt trước)
  - POST `/api/booking-management-for-keeper/create/passerby`
  - Body: thông tin slot/thời gian/xe/khách vãng lai
  - Dùng ở: nút “Tạo nhanh (Passerby)” tại quầy

- Xem các yêu cầu xung đột (nếu có dùng quy trình này)
  - GET `/api/conflict-request/keeper/{keeperId}?pageNo=&pageSize=`
  - Dùng ở: màn “Conflict/Issues” để theo dõi và xử lý

- Lưu ý hỗ trợ:
  - Lấy `keeperId` từ JWT claim `_id`
  - Lắng nghe SignalR: `KeeperCreateBookingForPasserby`, `CustomerCreateBookingSuccess`
