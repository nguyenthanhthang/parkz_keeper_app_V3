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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PricingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createParkingPrice,
  getParkingPrices,
  clearError,
} from '../../store/slices/pricingSlice';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function CreateEditPricingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PricingStackParamList, 'CreateEditPricing'>>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.pricing);

  const parkingPriceId = route.params?.parkingPriceId;
  const isEditMode = !!parkingPriceId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  // TODO: Load price data nếu edit mode (cần thêm API getPriceById hoặc từ list)

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên bảng giá');
      return false;
    }
    if (name.length > 50) {
      toast.showError('Tên bảng giá không được quá 50 ký tự');
      return false;
    }
    if (description && description.length > 250) {
      toast.showError('Mô tả không được quá 250 ký tự');
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
      if (isEditMode) {
        // TODO: Implement update API when available
        toast.showInfo('Chức năng cập nhật sẽ được triển khai sau');
      } else {
        await dispatch(
          createParkingPrice({
            name: name.trim(),
            managerId: user.id,
            description: description.trim() || undefined,
          })
        ).unwrap();
        toast.showSuccess('Tạo bảng giá thành công');
        navigation.goBack();
      }
    } catch (err: any) {
      toast.showError(err.message || 'Không thể lưu bảng giá');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {isEditMode ? 'Chỉnh sửa bảng giá' : 'Tạo bảng giá mới'}
          </Text>

          <TextInput
            label="Tên bảng giá *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="Ví dụ: Giá cơ bản, Giá theo giờ, Giá qua đêm"
            maxLength={50}
          />

          <TextInput
            label="Mô tả (tùy chọn)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Nhập mô tả bảng giá..."
            maxLength={250}
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
              {isEditMode ? 'Cập nhật' : 'Tạo'}
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

