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
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createSlot,
  updateSlot,
  getSlotsByFloor,
  clearError as clearSlotError,
} from '../../store/slices/slotSlice';
import { SlotStatus } from '../../types';

export default function CreateEditSlotScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'CreateEditSlot'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { currentSlots, isLoading, error } = useSelector(
    (state: RootState) => state.slot
  );

  const floorId = route.params?.floorId || 0;
  const slotId = route.params?.slotId;
  const isEditMode = !!slotId;

  const [name, setName] = useState('');
  const [slotType, setSlotType] = useState<'Car' | 'Moto' | 'Both'>('Car');
  const [status, setStatus] = useState<SlotStatus>(SlotStatus.AVAILABLE);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearSlotError());
    }
  }, [error, dispatch, toast]);

  useEffect(() => {
    // Load slot data nếu edit mode
    if (isEditMode && slotId) {
      const slot = currentSlots.find((s) => s.id === slotId);
      if (slot) {
        setName(slot.name);
        // TODO: Set slotType và status từ slot data nếu có
        setStatus(slot.status);
      }
    }
  }, [isEditMode, slotId, currentSlots]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên slot');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!floorId) {
      toast.showError('Không tìm thấy thông tin tầng');
      return;
    }

    try {
      if (isEditMode && slotId) {
        await dispatch(
          updateSlot({
            slotId,
            data: {
              name: name.trim(),
              slotType,
              status,
            },
          })
        ).unwrap();
        toast.showSuccess('Cập nhật slot thành công');
      } else {
        await dispatch(
          createSlot({
            name: name.trim(),
            floorId,
            slotType,
          })
        ).unwrap();
        toast.showSuccess('Tạo slot thành công');
        // Refresh slots list
        await dispatch(getSlotsByFloor(floorId));
      }
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err.message || 'Không thể lưu slot');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {isEditMode ? 'Chỉnh sửa slot' : 'Tạo slot mới'}
          </Text>

          <TextInput
            label="Tên slot *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="Ví dụ: A1, B2, P001"
          />

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.label}>
              Loại slot
            </Text>
            <SegmentedButtons
              value={slotType}
              onValueChange={(value) => setSlotType(value as 'Car' | 'Moto' | 'Both')}
              buttons={[
                { value: 'Car', label: 'Ô tô' },
                { value: 'Moto', label: 'Xe máy' },
                { value: 'Both', label: 'Cả hai' },
              ]}
            />
          </View>

          {isEditMode && (
            <View style={styles.section}>
              <Text variant="bodyMedium" style={styles.label}>
                Trạng thái
              </Text>
              <SegmentedButtons
                value={status}
                onValueChange={(value) => setStatus(value as SlotStatus)}
                buttons={[
                  { value: SlotStatus.AVAILABLE, label: 'Trống' },
                  { value: SlotStatus.OCCUPIED, label: 'Đã đỗ' },
                  { value: SlotStatus.DISABLED, label: 'Vô hiệu' },
                  { value: SlotStatus.RESERVED, label: 'Đặt trước' },
                ]}
              />
            </View>
          )}

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
  section: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#212121',
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

