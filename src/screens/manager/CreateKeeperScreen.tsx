import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createKeeper,
  clearError,
} from '../../store/slices/keeperSlice';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { CreateKeeperRequest } from '../../services/api/endpoints/keeperApi';

export default function CreateKeeperScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.keeper);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên keeper');
      return false;
    }
    if (!email.trim()) {
      toast.showError('Vui lòng nhập email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showError('Email không hợp lệ');
      return false;
    }
    if (!password.trim()) {
      toast.showError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      toast.showError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      toast.showError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      toast.showError('Không tìm thấy thông tin Manager');
      return;
    }

    try {
      const request: CreateKeeperRequest = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        managerId: user.id,
        phone: phone.trim() || undefined,
      };

      await dispatch(createKeeper(request)).unwrap();
      toast.showSuccess('Tạo keeper thành công');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err.message || 'Không thể tạo keeper');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Tạo keeper mới
          </Text>

          <TextInput
            label="Tên keeper *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="Nhập tên keeper"
          />

          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            placeholder="keeper@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Mật khẩu *"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            placeholder="Tối thiểu 6 ký tự"
            secureTextEntry
          />

          <TextInput
            label="Xác nhận mật khẩu *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
          />

          <TextInput
            label="Số điện thoại (tùy chọn)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            placeholder="0123456789"
            keyboardType="phone-pad"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={isLoading}
              loading={isLoading}
            >
              Tạo
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

