# Parkz Keeper App

Mobile application for parking lot keepers built with React Native and Expo.

## Features

- 🔐 Authentication (Login/Logout)
- 📅 Booking Management
- 🚗 Parking Slot Management
- ⚠️ Conflict Request Handling
- 👤 Profile Management

## Tech Stack

- React Native
- Expo Go
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Paper
- Axios
- SignalR

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app

### Project Structure

```
src/
├── components/     # Reusable components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── store/          # Redux store and slices
├── services/       # API services
├── hooks/          # Custom hooks
├── utils/          # Utility functions
└── types/          # TypeScript types
```

## Development Phases

- ✅ **Phase 1**: Setup & Authentication (Completed)
- 🔄 **Phase 2**: Booking Management (In Progress)
- ⏳ **Phase 3**: Slot Management
- ⏳ **Phase 4**: Conflict Request & Profile
- ⏳ **Phase 5**: Real-time & Polish
- ⏳ **Phase 6**: Testing & Deployment

## Configuration

### API Base URL

Update `src/utils/constants.ts` with your API base URL:

```typescript
export const API_BASE_URL = 'YOUR_API_URL';
```

### Authentication Endpoint

The login endpoint needs to be configured in `src/services/api/endpoints/authApi.ts`. Update `API_ENDPOINTS.LOGIN` with the correct endpoint path.

## License

Private project - Parkz

