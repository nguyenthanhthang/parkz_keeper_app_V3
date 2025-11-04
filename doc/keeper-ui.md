r## ParkZ Keeper - UI Specification (for React implementation)

### App Navigation
- **Entry**: `AuthenticationPage` → optional `OtpPage` → `HomePage` (tab layout)
- **Tabs (BottomAppBar in `HomePage`)**:
  - Dashboard (`/dashboard`)
  - Parking Map (`/parking-map`)
  - Booking List (`/bookings`)
  - Account (`/account`)
- **Global FAB**: Center docked button opens QR Scanner (`/qr`)
- **Detail Routes**:
  - Booking Detail: `/booking/:id`

---

### Authentication
- **Path**: `/auth`
- **Purpose**: Login with email and password.
- **Layout**:
  - Top illustration (SVG)
  - Title: “Đăng nhập”
  - Inputs:
    - Email (text)
    - Password (password with show/hide toggle)
  - Link: “Quên mật khẩu ?” (non-functional in current app)
  - Primary button: “Đăng nhập”
- **Actions**:
  - Login: calls API `login(email, password)`; on success → navigate to `HomePage`.
- **Notes**:
  - `AuthenticationPage.email` is stored globally for OTP info text.

### OTP Verification (optional)
- **Path**: `/otp`
- **Purpose**: Enter 6-digit OTP (currently navigates to Home on continue).
- **Layout**:
  - Lottie animation
  - Title: “Nhập mã OTP”
  - Subtitle: “Mã OTP được gửi tới email {email}”
  - 6-digit pin field (auto-fill capable)
  - Link: “Gửi lại mã OTP”
  - Primary button: “Tiếp tục” → navigate Home if code length == 6

---

### Home (Tabs Shell)
- **Path**: `/`
- **Layout**:
  - Body: renders current tab content
  - FAB: QR Scanner
  - Bottom tabs with icons:
    - Dashboard (active color: orange; inactive: navy)
    - Parking Map
    - Booking List
    - Account

---

### Dashboard
- **Path**: `/dashboard`
- **Purpose**: Summary for keeper/owner and revenue chart.
- **Data**:
  - `getProfile()` → name, role (Keeper → “Nhân viên” else “Chủ bãi xe”), parking name, avatar
  - `getDashboard()` → numberOfOrdersInCurrentDay, numberOfOrders, totalOfRevenue
- **Layout**:
  - Header: role + parking name, user name, avatar
  - KPI cards (2):
    - Today Orders (timer icon)
    - Total Orders (schedule icon)
  - Section: “Tổng doanh thu” with total and a line chart
  - Calendar icon (no-op)

---

### Parking Map
- **Path**: `/parking-map`
- **Purpose**: Visual floor map, slot availability, operator actions (book for guest, disable/enable slot), change slot for an existing booking.
- **Inputs/State**:
  - Floor dropdown (from `getFloorsByParking()`)
  - Date/time filter bottom sheet: day select (calendar), start hour picker (0–23), duration (1–12 h)
  - Time summary row: date, from time, to time
- **Data**:
  - `getSlotsParkingByFloor(floorId, start, end)` → grid of slots with `rowIndex`, `columnIndex`, `isBooked`, `isBackup`
- **Grid**:
  - Scrollable DataTable, each cell is a slot component with state colors
  - Tap on free slot selects it; long-press opens action sheet (if not in change-slot mode)
- **Bottom Sheets**:
  - If slot is available (`isBooked == 0`):
    - Action: “Đặt chỗ cho khách” → opens Guest Booking Dialog
  - If slot is disabled (`isBooked == 2`):
    - Action: “Kích hoạt chỗ” → `enableSlot(slotId)`
  - Always: “Vô hiệu hóa slot” → `disableSlot(slotId)`
- **Guest Booking Dialog**:
  - Readonly: Start time, End time (derived from start + duration)
  - Inputs: Duration (hours), Guest Name, Guest Phone, License Plate*, Vehicle Name*, Color*
  - Submit: “Đặt chỗ” → `createBooking(...)` then navigate to Booking Detail
- **Change Slot Mode**:
  - When opened with `bookingID`:
    - Bottom bar: “Chuyển chỗ” → `earlyChangeSlot` or `changeSlot` based on `isEarly`
    - Long press menu is disabled; tap only selects available slot

---

### Booking List
- **Path**: `/bookings`
- **Purpose**: List bookings with search and pull-to-refresh.
- **Data**:
  - `getBookingList()` or `getBookingBySearch(q)`
- **Layout**:
  - SliverAppBar (pinned, navy):
    - Title: “Danh sách đơn”
    - Filter icon (no-op)
    - Search bar: placeholder “Mã đơn I Tên khách I Biển số”
      - Submit triggers search; clear icon resets
  - Content:
    - While loading: skeleton list
    - If data: list of `ActivityCard` items with props:
      - bookingId, dateBook, startTime, endTime, licensePlate, address, parkingName, floorName, slotName, status
    - Else: `EmptyBooking` placeholder

---

### Booking Detail
- **Path**: `/booking/:id`
- **Purpose**: Operate on a single booking: approve, check-in, check-out, change slot, handle payments.
- **Data**:
- `getBookingDetail(id)` returns:
  - bookingDetails: bookingId, status, startTime, endTime, checkinTime, checkoutTime, totalPrice
  - user (nullable): name, phone
  - guestPhone, guestName (optional fields for booked-on-behalf)
  - vehicleInfor: licensePlate, vehicleName, color
  - parkingWithBookingDetailDto: parkingId, name, address
  - floorWithBookingDetailDto: floorName
  - parkingSlotWithBookingDetailDto: name
  - transactionWithBookingDetailDtos[0].paymentMethod (e.g., `tra_sau`)
  - unPaidMoney
- **Header**:
  - Transparent AppBar: title “Chi tiết đơn đặt”, Home icon
- **Bottom Bar (conditional by status)**:
  - If status in [Initial, Success]:
    - Secondary: “Từ chối” → `cancelBooking(id)` and navigate back to list
    - Primary:
      - Initial → “Xác nhận đơn” → `approveBooking(id)`
      - Success → “Check-in” → `checkInBooking(id)`; on specific conflicts, prompt to change slot via Parking Map (`isEarly` true/false)
  - If status in [Check_In, OverTime, Check_Out]:
    - Primary: “Check-out”
      - If `paymentMethod == tra_sau`: open `BookingInfoPopup` (cash flow)
      - Else: `checkoutOnline(id, parkingId)` → if more info needed, show dialog with transactions and 2 buttons:
        - “Thanh toán tiền mặt” → `checkoutBooking(thanh_toan_tien_mat)`
        - “Thanh toán qua ví” → `checkoutBooking(thanh_toan_online)`
- **Content Sections**:
  - Customer card:
    - If user present: Name, Phone; else “Khách vãng lai”
    - If guestPhone present: “Số người đặt hộ”, “Tên người đặt hộ”
    - Vehicle: License Plate, Brand
  - Booking info card:
    - Address (with dialog to show full address), Position (Floor - Slot), Parking name, Date, Time range, Check-in/Check-out times
  - Summary card:
    - Status tag, Booking ID (copy), Payment method, Total price

---

### QR Scanner
- **Path**: `/qr`
- **Purpose**: Scan customer QR to open booking detail.
- **Behavior**:
  - On scan: if code contains `pz-<id>`, parse id and navigate to `/booking/:id`; else show error snackbar.
- **Controls**: Toggle Flash, Flip Camera

---

### Account
- **Path**: `/account`
- **Purpose**: Profile overview, personal info, change password, support, logout.
- **Layout**:
  - Header: profile summary (`ProfileHeader`)
  - Menu items:
    - “Thông tin cá nhân” → `/account/personal-information`
    - “Đổi mật khẩu” → password dialog
    - “Hỗ trợ” (placeholder)
    - “Đăng xuất” → confirm dialog; clears token and redirects to `/auth`

### Personal Information
- **Path**: `/account/personal-information`
- **Layout**:
  - AppBar: “Thông tin cá nhân”, Edit/Save toggle
  - Header gradient with avatar and camera button
  - Body content TBD (empty in current code)

---

### Shared UI Styles
- **Colors** (from `AppColor`):
  - navy, navyPale, forText, orange, paleOrange, fadeText
- **Text components**: `SemiBoldText`, `MediumText`, `RegularText`
- **Buttons**: `MyButton` (rounded, primary), standard `OutlinedButton`

---

### React Implementation Guidance
- **Routing**: React Router with routes mirroring paths above; nested layout for tabs.
- **State/Data**: Use React Query for API calls mirroring Flutter `network/api.dart` endpoints.
- **Components**:
  - Shared: Button, Text variants, StatusTag, ActivityCard, Slot cell, ProfileHeader, ProfileMenu
  - Feature-specific: BookingInfoModal, DateFilterSheet, GuestBookingDialog, QRScanner view
- **Parking Grid**: Render a virtualized grid; compute rows/cols from `rowIndex`/`columnIndex`; maintain selected cell state; support long-press menu analog via context menu or three-dots action.
- **Forms**: Use controlled inputs; validation aligned with Flutter (required fields marked with `*`).

---

### Screen-to-API Mapping (summary)
- Auth: `login(email, password)`
- Dashboard: `getProfile()`, `getDashboard()`
- Booking List: `getBookingList()`, `getBookingBySearch(q)`
- Booking Detail: `getBookingDetail(id)`, `approveBooking(id)`, `cancelBooking(id)`, `checkInBooking(id)`, `checkoutOnline(id, parkingId)`, `checkoutBooking(id, parkingId, method, ...)`
- Parking Map: `getFloorsByParking()`, `getSlotsParkingByFloor(floorId, start, end)`, `createBooking(...)`, `enableSlot(id)`, `disableSlot(id)`, `changeSlot(slotId, bookingId)`, `earlyChangeSlot(slotId, bookingId)`


