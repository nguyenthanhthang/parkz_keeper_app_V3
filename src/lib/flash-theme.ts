import FlashMessage from 'react-native-flash-message';

// Set global color theme NGAY KHI IMPORT để override default colors
// File này phải được import SỚM NHẤT trong app (trong index.js)
FlashMessage.setColorTheme({
  success: '#4caf50', // Xanh lá cho thành công
  info: '#2196f3',     // Xanh dương cho thông tin
  warning: '#ffc107',  // Vàng cho cảnh báo
  danger: '#f44336',  // Đỏ cho lỗi
});

