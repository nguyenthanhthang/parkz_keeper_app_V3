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
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createFloor,
  updateFloor,
  getFloorsByParking,
  clearError,
} from '../../store/slices/floorSlice';

export default function CreateEditFloorScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'CreateEditFloor'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.floor);

  const parkingId = route.params?.parkingId || 0;
  const floorId = route.params?.floorId;
  const isEditMode = !!floorId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  // TODO: Load floor data nếu edit mode (cần thêm API getFloorById hoặc từ list)

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên tầng');
      return false;
    }
    if (name.length > 50) {
      toast.showError('Tên tầng không được quá 50 ký tự');
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

    if (!parkingId) {
      toast.showError('Không tìm thấy thông tin bãi đỗ');
      return;
    }

    try {
      if (isEditMode && floorId) {
        await dispatch(
          updateFloor({
            floorId,
            data: {
              name: name.trim(),
              description: description.trim() || undefined,
            },
          })
        ).unwrap();
        toast.showSuccess('Cập nhật tầng thành công');
      } else {
        await dispatch(
          createFloor({
            name: name.trim(),
            parkingId,
            description: description.trim() || undefined,
          })
        ).unwrap();
        toast.showSuccess('Tạo tầng thành công');
      }
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err.message || 'Không thể lưu tầng');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {isEditMode ? 'Chỉnh sửa tầng' : 'Tạo tầng mới'}
          </Text>

          <TextInput
            label="Tên tầng *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="Ví dụ: Tầng 1, Tầng G, Tầng hầm B1"
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
            placeholder="Nhập mô tả tầng..."
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

