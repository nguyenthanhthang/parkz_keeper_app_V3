# THIẾT KẾ UNIFIED APP - MANAGER & KEEPER DÙNG CHUNG

## 📋 TỔNG QUAN

### Concept: Một App cho cả Manager và Keeper
- **Platform**: Mobile App (React Native / Flutter) hoặc Responsive Web App
- **Approach**: Role-based UI rendering - hiển thị features khác nhau dựa vào role
- **Lợi ích**: 
  - Code reuse cao
  - Dễ maintain
  - Manager có thể dùng mobile khi cần
  - Keeper không cần học app mới

---

## 🏗️ KIẾN TRÚC UNIFIED APP

### Architecture Pattern

```
┌─────────────────────────────────────────┐
│         UNIFIED APP LAYER                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Authentication & Role Check    │ │
│  └────────────────────────────────────┘ │
│                  │                       │
│                  ▼                       │
│  ┌────────────────────────────────────┐ │
│  │      Role-Based Router            │ │
│  │  - Manager Routes                 │ │
│  │  - Keeper Routes                  │ │
│  │  - Shared Routes                  │ │
│  └────────────────────────────────────┘ │
│                  │                       │
│        ┌──────────┴──────────┐           │
│        ▼                     ▼           │
│  ┌──────────┐         ┌──────────┐     │
│  │ MANAGER  │         │  KEEPER   │     │
│  │  UI      │         │    UI     │     │
│  └──────────┘         └──────────┘     │
│                                          │
└─────────────────────────────────────────┘
```

### Technology Stack Options

#### Option 1: React Native (Mobile-First) ⭐ Recommended
- **Pros**: 
  - Cross-platform (iOS + Android)
  - Native performance
  - Responsive cho tablet (Manager có thể dùng)
  - Large screen support tốt
- **Cons**: 
  - Desktop web không tối ưu (nhưng có thể dùng responsive)

#### Option 2: Responsive Web App (PWA)
- **Pros**:
  - Một codebase cho tất cả platforms
  - Dễ deploy
  - Desktop và mobile đều support tốt
- **Cons**:
  - Performance không bằng native
  - Một số native features hạn chế

#### Option 3: Flutter
- **Pros**: 
  - Cross-platform (iOS, Android, Web)
  - Good performance
  - Material Design built-in
- **Cons**:
  - Web performance chưa tối ưu

**Khuyến nghị: React Native** vì:
- Manager có thể dùng tablet hoặc smartphone
- Performance tốt
- Native feel
- Có thể responsive cho tablet lớn

---

## 🔐 AUTHENTICATION & ROLE DETECTION

### Login Flow

```
Login Screen
  │
  ├─→ API: POST /api/business-manager-authentication
  │
  ├─→ Response có role trong token
  │
  └─→ Save role to state/storage
      │
      ├─→ Role = "Manager" → Navigate to Manager Home
      └─→ Role = "Keeper" → Navigate to Keeper Home
```

### Role Storage

```typescript
// After login
interface UserState {
  userId: number;
  email: string;
  name: string;
  role: 'Manager' | 'Keeper';
  token: string;
  // Manager specific
  managerId?: number;
  // Keeper specific
  keeperId?: number;
  parkingId?: number;
}
```

---

## 📱 NAVIGATION STRUCTURE (UNIFIED)

### Bottom Tab Navigation (Primary)

```
┌─────────────────────────────────────────┐
│         HEADER (Dynamic)              │
│  - Manager: Logo | Notifications      │
│  - Keeper: Avatar | Parking Badge     │
└─────────────────────────────────────────┘
│                                          │
│         MAIN CONTENT AREA               │
│  (Changes based on role)                 │
│                                          │
└─────────────────────────────────────────┘
│      BOTTOM TABS (Role-Based)          │
│ ┌──────┬──────┬──────┬──────┬──────┐  │
│ │ Home │ Mod1 │ Mod2 │ Mod3 │Profile│  │
│ └──────┴──────┴──────┴──────┴──────┘  │
└─────────────────────────────────────────┘
```

### Navigation Config by Role

#### Manager Tabs:
1. **Home** - Dashboard với stats
2. **Parkings** - Quản lý bãi đỗ
3. **Bookings** - Quản lý booking
4. **Keeper** - Quản lý keeper
5. **Profile** - Profile & Settings

#### Keeper Tabs:
1. **Home** - Dashboard nhanh
2. **Bookings** - Booking management
3. **Slots** - Slot management
4. **Conflicts** - Conflict requests
5. **Profile** - Profile & Settings

---

## 🎨 SCREEN DESIGN - ROLE-BASED

### 1. Home Screen (Dynamic Content)

#### Manager Home:
```
┌─────────────────────────────────┐
│  👤 Manager Name                 │
│  📍 Business Name                │
├─────────────────────────────────┤
│  📊 STATISTICS CARDS             │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │Parkings│ │Bookings│ │Revenue│ │
│  └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│  📈 QUICK CHARTS                 │
│  ┌─────────────────────────┐   │
│  │  Revenue Chart (Mini)    │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  ⚡ QUICK ACTIONS                │
│  [➕ Add Parking]                │
│  [✅ Approve Bookings]           │
│  [👥 Add Keeper]                 │
└─────────────────────────────────┘
```

#### Keeper Home:
```
┌─────────────────────────────────┐
│  👤 Keeper Name                  │
│  🏢 Parking: [Parking Name]     │
│  [Mark Full] [Not Full]         │
├─────────────────────────────────┤
│  📊 QUICK STATS                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │Today│ │Avail│ │Confl│        │
│  │Booking│ │Slot│ │icts│        │
│  └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│  ⚡ QUICK ACTIONS                │
│  [➕ Create Booking] (Large)     │
│  [🔍 View Slots]                 │
├─────────────────────────────────┤
│  📋 TODAY'S BOOKINGS             │
│  ┌─────────────────────────┐    │
│  │ Booking #123            │    │
│  │ Customer: John Doe      │    │
│  │ Slot: A-01              │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Implementation Pattern

```typescript
// HomeScreen.tsx
const HomeScreen = () => {
  const { role } = useAuth();
  
  if (role === 'Manager') {
    return <ManagerHome />;
  } else if (role === 'Keeper') {
    return <KeeperHome />;
  }
  
  return <LoginScreen />;
};
```

---

## 🔄 SHARED SCREENS vs ROLE-SPECIFIC

### Shared Screens (Dùng chung cho cả 2 roles)

1. **Login Screen** ✅
   - Cùng API: `POST /api/business-manager-authentication`
   - Auto-detect role từ response

2. **Profile Screen** ✅ (với conditional content)
   - View profile: Cả 2 đều dùng
   - Change password: Cả 2 đều dùng
   - Settings: Khác nhau (Manager có thêm options)

3. **Booking Detail Screen** ✅ (với conditional actions)
   - View info: Cả 2 đều dùng
   - Actions: 
     - Manager: Approve, Check-out, Mark Done
     - Keeper: Change Slot, View info only

4. **Parking Image Screen** ✅
   - Cả 2 đều xem được

### Role-Specific Screens

#### Manager Only:
- Parking Management (CRUD)
- Floor Management
- Slot Setup (Initial)
- Pricing Management
- Keeper Management
- Statistics & Charts
- Booking Approval Screen

#### Keeper Only:
- Create Passerby Booking
- Slot Management (Change, Disable)
- Conflict Request List
- Available Slots View

---

## 📐 RESPONSIVE DESIGN STRATEGY

### Mobile (Smartphone) - Default
- Bottom tab navigation
- Single column layout
- Cards và lists
- Full-screen modals

### Tablet - Manager Optimized
- Sidebar navigation (có thể thêm)
- Two-column layout khi có thể
- Expanded tables
- Split-screen cho detail views

### Implementation

```typescript
// useDeviceType.ts
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('phone');
  
  useEffect(() => {
    const width = Dimensions.get('window').width;
    if (width >= 1024) setDeviceType('desktop');
    else if (width >= 768) setDeviceType('tablet');
    else setDeviceType('phone');
  }, []);
  
  return deviceType;
};

// Usage
const { role, deviceType } = useApp();
const isManagerTablet = role === 'Manager' && deviceType === 'tablet';
```

---

## 🎯 FEATURE FLOW BY ROLE

### Manager Flow Examples

**Flow 1: Quản lý Bãi Đỗ**
```
Home → [Parkings Tab] → Parking List → [Add] → Create Form → Submit → Success
```

**Flow 2: Duyệt Booking**
```
Home → [Bookings Tab] → Booking List → [Tap Booking] → Detail → [Approve] → Success
```

**Flow 3: Quản lý Keeper**
```
Home → [Keeper Tab] → Keeper List → [Add Keeper] → Create Form → Submit
```

### Keeper Flow Examples

**Flow 1: Tạo Booking Passerby**
```
Home → [➕ Create Booking] → Select Slot → Enter Info → Confirm → Success
```

**Flow 2: Đổi Slot**
```
Home → [Slots Tab] → Slot List → [Tap Slot] → [Change Slot] → Select New → Confirm
```

**Flow 3: Xem Conflict**
```
Home → [Conflicts Tab] → Conflict List → [Tap] → Detail
```

---

## 🧩 COMPONENT ARCHITECTURE

### Shared Components

```typescript
// Components/Shared/
- Button
- Input
- Card
- Badge
- LoadingSpinner
- EmptyState
- ErrorMessage
- Header
- BottomTabBar
```

### Role-Specific Components

```typescript
// Components/Manager/
- StatisticsCard
- RevenueChart
- ParkingCard
- BookingTable
- KeeperListCard

// Components/Keeper/
- BookingCard
- SlotGrid
- QuickActionButton
- ConflictCard
```

### Conditional Rendering Pattern

```typescript
// Example: BookingDetailScreen.tsx
const BookingDetailScreen = ({ bookingId }) => {
  const { role } = useAuth();
  const booking = useBooking(bookingId);
  
  return (
    <Screen>
      <BookingInfo data={booking} />
      
      {/* Conditional Actions */}
      {role === 'Manager' && (
        <>
          {booking.status === 'Pending' && (
            <Button onPress={handleApprove}>Approve</Button>
          )}
          {booking.status === 'Approved' && (
            <Button onPress={handleCheckout}>Check-out</Button>
          )}
        </>
      )}
      
      {role === 'Keeper' && booking.status === 'Approved' && (
        <Button onPress={handleChangeSlot}>Change Slot</Button>
      )}
    </Screen>
  );
};
```

---

## 🔐 PERMISSION & ROUTE GUARDING

### Route Guards

```typescript
// Navigation/guards.tsx
const ProtectedRoute = ({ component: Component, allowedRoles, ...props }) => {
  const { role } = useAuth();
  
  if (!allowedRoles.includes(role)) {
    return <AccessDeniedScreen />;
  }
  
  return <Component {...props} />;
};

// Usage
<Stack.Screen
  name="ParkingManagement"
  component={ProtectedRoute(ParkingManagementScreen, ['Manager'])}
/>

<Stack.Screen
  name="CreateBooking"
  component={ProtectedRoute(CreateBookingScreen, ['Keeper'])}
/>
```

### API Permission Checks

```typescript
// hooks/useRolePermission.ts
const useRolePermission = () => {
  const { role } = useAuth();
  
  const canManageParkings = role === 'Manager';
  const canManageBookings = role === 'Manager' || role === 'Keeper';
  const canCreatePasserbyBooking = role === 'Keeper';
  const canApproveBooking = role === 'Manager';
  const canManageKeepers = role === 'Manager';
  const canViewStatistics = role === 'Manager';
  
  return {
    canManageParkings,
    canManageBookings,
    canCreatePasserbyBooking,
    canApproveBooking,
    canManageKeepers,
    canViewStatistics,
  };
};
```

---

## 📱 RESPONSIVE LAYOUT EXAMPLES

### Manager - Tablet View

```
┌──────────────┬─────────────────────────┐
│  SIDEBAR     │    MAIN CONTENT         │
│              │                         │
│ 🏠 Home      │  ┌───────────────────┐ │
│ 🏢 Parkings  │  │  Parking List      │ │
│ 📅 Bookings  │  │  (2 columns)       │ │
│ 👥 Keepers   │  └───────────────────┘ │
│ 📊 Stats     │                         │
│              │  ┌───────────────────┐ │
│              │  │  Quick Stats      │ │
│              │  └───────────────────┘ │
└──────────────┴─────────────────────────┘
```

### Manager - Mobile View

```
┌─────────────────────────┐
│      HEADER             │
├─────────────────────────┤
│  CONTENT AREA           │
│                        │
│  (Single column)       │
│                        │
├─────────────────────────┤
│  BOTTOM TABS           │
└─────────────────────────┘
```

### Keeper - Mobile View (Always)

```
┌─────────────────────────┐
│      HEADER             │
│  (Avatar | Parking)     │
├─────────────────────────┤
│  QUICK STATS            │
│  ┌───┐ ┌───┐ ┌───┐     │
├─────────────────────────┤
│  QUICK ACTIONS          │
│  [Create Booking]       │
├─────────────────────────┤
│  TODAY'S BOOKINGS       │
│  (List)                 │
├─────────────────────────┤
│  BOTTOM TABS            │
└─────────────────────────┘
```

---

## 🎨 UI/UX ADAPTATIONS

### Color Coding by Role

```typescript
const theme = {
  manager: {
    primary: '#1890ff', // Blue
    secondary: '#722ed1', // Purple
  },
  keeper: {
    primary: '#52c41a', // Green
    secondary: '#faad14', // Orange
  },
  shared: {
    success: '#52c41a',
    error: '#f5222d',
    warning: '#faad14',
  }
};
```

### Typography Adjustments

- **Manager**: More text, detailed information
- **Keeper**: Larger buttons, clear labels, minimal text

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Setup project (React Native / Flutter / Web)
- [ ] Authentication với role detection
- [ ] Role-based navigation
- [ ] Shared components library
- [ ] Permission hooks

### Phase 2: Shared Features
- [ ] Login screen
- [ ] Profile screen (conditional)
- [ ] Booking detail (conditional actions)
- [ ] Common UI components

### Phase 3: Manager Features
- [ ] Manager home (dashboard)
- [ ] Parking management
- [ ] Booking management (approve, checkout)
- [ ] Keeper management
- [ ] Statistics & charts

### Phase 4: Keeper Features
- [ ] Keeper home
- [ ] Create passerby booking
- [ ] Slot management
- [ ] Conflict requests

### Phase 5: Polish
- [ ] Responsive design (tablet optimization)
- [ ] Role-based theming
- [ ] Error handling
- [ ] Loading states
- [ ] Real-time updates (SignalR)

---

## 🚀 CODE STRUCTURE

```
unified-app/
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Main navigator với role check
│   │   ├── ManagerNavigator.tsx    # Manager routes
│   │   ├── KeeperNavigator.tsx     # Keeper routes
│   │   └── AuthNavigator.tsx       # Auth flow
│   │
│   ├── screens/
│   │   ├── shared/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── BookingDetailScreen.tsx
│   │   ├── manager/
│   │   │   ├── ManagerHomeScreen.tsx
│   │   │   ├── ParkingListScreen.tsx
│   │   │   ├── BookingManagementScreen.tsx
│   │   │   └── ...
│   │   └── keeper/
│   │       ├── KeeperHomeScreen.tsx
│   │       ├── CreateBookingScreen.tsx
│   │       ├── SlotManagementScreen.tsx
│   │       └── ...
│   │
│   ├── components/
│   │   ├── shared/
│   │   ├── manager/
│   │   └── keeper/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth + role
│   │   ├── useRolePermission.ts    # Permission checks
│   │   └── useDeviceType.ts        # Responsive
│   │
│   ├── services/
│   │   ├── api.ts                   # API calls
│   │   └── auth.ts                  # Auth service
│   │
│   └── utils/
│       ├── roleUtils.ts             # Role helpers
│       └── permissions.ts           # Permission constants
```

---

## 💡 ADVANTAGES OF UNIFIED APP

1. **Code Reuse**: Shared components, screens, utilities
2. **Consistency**: Same design language, UX patterns
3. **Maintenance**: One codebase to maintain
4. **Flexibility**: Manager có thể dùng mobile khi cần
5. **Cost**: Develop một lần, deploy nhiều platform
6. **User Experience**: Familiar interface

## ⚠️ CONSIDERATIONS

1. **Bundle Size**: Cần optimize, tree-shaking
2. **Code Complexity**: Cần structure rõ ràng
3. **Testing**: Test cho cả 2 roles
4. **Performance**: Monitor performance cho từng role

---

## 🎯 RECOMMENDATION

### Best Approach: React Native App với Responsive Design

**Reasons:**
1. Mobile-first: Keeper cần mobile, Manager có thể dùng tablet
2. Cross-platform: iOS + Android
3. Native performance
4. Tablet support tốt cho Manager
5. Code reuse cao
6. Active community

**Alternative cho Desktop-heavy Manager:**
- React Native cho mobile
- Responsive Web App (React) cho desktop/tablet
- Share business logic và API layer

---

## 📝 SUMMARY

Với unified app approach:
- ✅ Một codebase cho cả Manager và Keeper
- ✅ Role-based UI rendering
- ✅ Shared components và screens
- ✅ Responsive cho cả mobile và tablet
- ✅ Permission-based routing
- ✅ Consistent UX/UI design

**Key Implementation Points:**
1. Detect role sau login
2. Conditional navigation (tabs và routes)
3. Permission checks cho mỗi feature
4. Responsive design cho tablet (Manager)
5. Shared vs role-specific components

