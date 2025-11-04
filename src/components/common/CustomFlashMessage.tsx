import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TOAST_WIDTH = width * 0.33; // Chỉ chiếm 1/3 màn hình (33%)

interface CustomFlashMessageProps {
  message?: string;
  description?: string;
  type?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  style?: any;
  icon?: string;
  duration?: number;
}

const getToastConfig = (type?: string) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#4caf50',
        icon: 'check-circle' as const,
        iconColor: '#ffffff',
        borderColor: '#2e7d32',
      };
    case 'danger':
      return {
        backgroundColor: '#f44336',
        icon: 'close-circle' as const,
        iconColor: '#ffffff',
        borderColor: '#c62828',
      };
    case 'warning':
      return {
        backgroundColor: '#ff9800',
        icon: 'alert-circle' as const,
        iconColor: '#ffffff',
        borderColor: '#f57c00',
      };
    case 'info':
      return {
        backgroundColor: '#2196f3',
        icon: 'information' as const,
        iconColor: '#ffffff',
        borderColor: '#1565c0',
      };
    default:
      return {
        backgroundColor: '#6200ee',
        icon: 'information' as const,
        iconColor: '#ffffff',
        borderColor: '#4a148c',
      };
  }
};

export default function CustomFlashMessage(props: CustomFlashMessageProps) {
  const { message, description, type = 'default', style } = props;
  const config = getToastConfig(type);
  
  // Đảm bảo chỉ render string, không render object
  let displayMessage = 'Thông báo';
  if (typeof message === 'string' && message.trim()) {
    displayMessage = message;
  } else if (typeof description === 'string' && description.trim()) {
    displayMessage = description;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
    >
      <View style={[styles.borderLeft, { backgroundColor: config.borderColor }]} />
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon}
          size={16}
          color={config.iconColor}
        />
        <Text style={styles.message} numberOfLines={2}>
          {displayMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOAST_WIDTH,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  borderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 2,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 1,
  },
});

