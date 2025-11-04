import React from "react";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import FlashMessage from "react-native-flash-message";
import { store } from "./src/store/store";
import AppNavigator from "./src/navigation/AppNavigator";
// Theme đã được set trong src/lib/flash-theme.ts (import trong index.js)

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <AppNavigator />
          {/* Chỉ có 1 instance FlashMessage duy nhất ở đây - không set màu tại đây */}
          <FlashMessage position="top" floating duration={3000} />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
