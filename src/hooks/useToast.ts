import { useCallback } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { showMessage } from "react-native-flash-message";

// Base style chung cho tất cả toast
const baseStyle: ViewStyle = {
  width: "33%",
  alignSelf: "flex-end",
  marginRight: 16,
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 8,
  minHeight: 40,
};

export const useToast = () => {
  // Ép màu "an toàn" - dùng type: 'default' và set backgroundColor trực tiếp
  const showSuccess = useCallback((message: string, duration?: number) => {
    showMessage({
      message: message,
      type: "default", // 👈 Bỏ mapping theo theme, ép màu trực tiếp
      backgroundColor: "#4caf50", // 👈 Ép màu xanh tại message
      color: "#ffffff",
      style: baseStyle,
      titleStyle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
      },
      textStyle: {
        color: "#ffffff",
      },
      floating: true,
      duration: duration || 3000,
    });
  }, []);

  const showError = useCallback((message: string, duration?: number) => {
    showMessage({
      message: message,
      type: "default", // 👈 Ép màu trực tiếp
      backgroundColor: "#f44336", // 👈 Ép màu đỏ
      color: "#ffffff",
      style: baseStyle,
      titleStyle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
      },
      textStyle: {
        color: "#ffffff",
      },
      floating: true,
      duration: duration || 4000,
    });
  }, []);

  const showWarning = useCallback((message: string, duration?: number) => {
    showMessage({
      message: message,
      type: "default", // 👈 Ép màu trực tiếp
      backgroundColor: "#ffc107", // 👈 Ép màu vàng
      color: "#000000", // Text màu đen cho dễ đọc trên nền vàng
      style: baseStyle,
      titleStyle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000000",
      },
      textStyle: {
        color: "#000000",
      },
      floating: true,
      duration: duration || 3000,
    });
  }, []);

  const showInfo = useCallback((message: string, duration?: number) => {
    showMessage({
      message: message,
      type: "default", // 👈 Ép màu trực tiếp
      backgroundColor: "#2196f3", // 👈 Ép màu xanh dương
      color: "#ffffff",
      style: baseStyle,
      titleStyle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
      },
      textStyle: {
        color: "#ffffff",
      },
      floating: true,
      duration: duration || 3000,
    });
  }, []);

  const hideToast = useCallback(() => {
    // FlashMessage tự động ẩn, nhưng có thể dùng hideMessage nếu cần
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast: showInfo, // Backward compatibility
    hideToast,
  };
};
