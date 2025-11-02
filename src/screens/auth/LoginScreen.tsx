import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Surface, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials, UserRole } from '../../types';

export default function LoginScreen() {
  const { login, isLoading, error, mockLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(UserRole.KEEPER);
  
  // Pre-fill test credentials based on role
  const getDefaultCredentials = useCallback((role: string) => {
    if (role === UserRole.MANAGER) {
      return {
        email: __DEV__ ? 'newmanager@parkz.com' : '',
        password: __DEV__ ? 'parknow123' : '',
      };
    } else {
      return {
        email: __DEV__ ? 'newkeeper@parkz.com' : '',
        password: __DEV__ ? 'parknow123' : '',
      };
    }
  }, []);

  const [email, setEmail] = useState(() => getDefaultCredentials(UserRole.KEEPER).email);
  const [password, setPassword] = useState(() => getDefaultCredentials(UserRole.KEEPER).password);

  // Memoize setEmail and setPassword to prevent re-renders
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  // Memoize form filled check to prevent unnecessary re-renders
  const isFormFilled = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const onSubmit = useCallback(async () => {
    if (!isFormFilled || isLoading) return;
    
    const credentials: LoginCredentials = {
      email: email.trim(),
      password: password.trim(),
      role: selectedRole as UserRole,
    };

    try {
      await login(credentials).unwrap();
      // Navigation will be handled automatically by AppNavigator based on role
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Thông tin đăng nhập không hợp lệ');
    }
  }, [email, password, selectedRole, isFormFilled, isLoading, login]);

  // DEV ONLY: Bypass login để test các chức năng khác
  const handleSkipLogin = useCallback(() => {
    if (mockLogin) {
      mockLogin(selectedRole);
    }
  }, [mockLogin, selectedRole]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface}>
          <Text variant="displaySmall" style={styles.title}>
            Parkz App
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Đăng nhập để tiếp tục
          </Text>

          <View style={styles.form}>
            <SegmentedButtons
              value={selectedRole}
              onValueChange={(value) => {
                setSelectedRole(value);
                // Auto-fill credentials when switching roles
                const credentials = getDefaultCredentials(value);
                setEmail(credentials.email);
                setPassword(credentials.password);
              }}
              buttons={[
                {
                  value: UserRole.KEEPER,
                  label: 'Nhân viên',
                  style: styles.segmentButton,
                },
                {
                  value: UserRole.MANAGER,
                  label: 'Quản lý',
                  style: styles.segmentButton,
                },
              ]}
              style={styles.segmentedButtons}
            />
            <TextInput
              label="Email"
              placeholder="Nhập email"
              mode="outlined"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              editable={!isLoading}
            />

            <TextInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              mode="outlined"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              editable={!isLoading}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              mode="contained"
              onPress={onSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              buttonColor="#6200ee"
              contentStyle={styles.buttonContent}
              textColor="#ffffff"
              rippleColor="rgba(255, 255, 255, 0.3)"
            >
              Đăng nhập
            </Button>

            {/* DEV ONLY: Skip Login button */}
            {__DEV__ && mockLogin && (
              <Button
                mode="outlined"
                onPress={handleSkipLogin}
                disabled={isLoading}
                style={[styles.button, styles.skipButton]}
                contentStyle={styles.buttonContent}
                textColor="#6200ee"
              >
                ⚡ Bỏ qua đăng nhập (Chỉ Dev)
              </Button>
            )}
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#b00020',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
  },
  skipButton: {
    marginTop: 12,
    borderColor: '#6200ee',
  },
});
