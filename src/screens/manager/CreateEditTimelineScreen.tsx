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
  createTimeline,
  updateTimeline,
  getTimelinesByPrice,
  clearError,
} from '../../store/slices/pricingSlice';
import { useToast } from '../../hooks/useToast';

export default function CreateEditTimelineScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PricingStackParamList, 'CreateEditTimeline'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { timelines, isLoading, error } = useSelector(
    (state: RootState) => state.pricing
  );

  const parkingPriceId = route.params?.parkingPriceId || 0;
  const timelineId = route.params?.timelineId;
  const isEditMode = !!timelineId;

  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  useEffect(() => {
    // Load timeline data nếu edit mode
    if (isEditMode && timelineId) {
      const timeline = timelines.find((t) => t.id === timelineId);
      if (timeline) {
        setStartTime(timeline.startTime.slice(0, 5));
        setEndTime(timeline.endTime.slice(0, 5));
        setPrice(timeline.price.toString());
        setDescription(timeline.description || '');
      }
    }
  }, [isEditMode, timelineId, timelines]);

  const validateForm = (): boolean => {
    if (!startTime.trim()) {
      toast.showError('Vui lòng nhập thời gian bắt đầu');
      return false;
    }
    if (!endTime.trim()) {
      toast.showError('Vui lòng nhập thời gian kết thúc');
      return false;
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      toast.showError('Thời gian bắt đầu không hợp lệ (định dạng: HH:mm)');
      return false;
    }
    if (!timeRegex.test(endTime)) {
      toast.showError('Thời gian kết thúc không hợp lệ (định dạng: HH:mm)');
      return false;
    }
    if (endTime <= startTime) {
      toast.showError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return false;
    }
    if (!price.trim()) {
      toast.showError('Vui lòng nhập giá');
      return false;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.showError('Giá phải là số dương');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!parkingPriceId) {
      toast.showError('Không tìm thấy thông tin bảng giá');
      return;
    }

    try {
      if (isEditMode && timelineId) {
        await dispatch(
          updateTimeline({
            timelineId,
            data: {
              startTime: `${startTime}:00`,
              endTime: `${endTime}:00`,
              price: parseFloat(price),
              description: description.trim() || undefined,
            },
          })
        ).unwrap();
        toast.showSuccess('Cập nhật timeline thành công');
      } else {
        await dispatch(
          createTimeline({
            parkingPriceId,
            startTime: `${startTime}:00`,
            endTime: `${endTime}:00`,
            price: parseFloat(price),
            description: description.trim() || undefined,
          })
        ).unwrap();
        toast.showSuccess('Tạo timeline thành công');
      }
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err.message || 'Không thể lưu timeline');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {isEditMode ? 'Chỉnh sửa timeline' : 'Tạo timeline mới'}
          </Text>

          <TextInput
            label="Thời gian bắt đầu *"
            value={startTime}
            onChangeText={setStartTime}
            mode="outlined"
            style={styles.input}
            placeholder="HH:mm (ví dụ: 08:00)"
            keyboardType="default"
            right={<TextInput.Icon icon="clock" />}
          />
          <Text variant="bodySmall" style={styles.helperText}>
            Định dạng: HH:mm (ví dụ: 08:00)
          </Text>

          <TextInput
            label="Thời gian kết thúc *"
            value={endTime}
            onChangeText={setEndTime}
            mode="outlined"
            style={styles.input}
            placeholder="HH:mm (ví dụ: 18:00)"
            keyboardType="default"
            right={<TextInput.Icon icon="clock" />}
          />
          <Text variant="bodySmall" style={styles.helperText}>
            Định dạng: HH:mm (ví dụ: 18:00)
          </Text>

          <TextInput
            label="Giá (VNĐ) *"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            style={styles.input}
            placeholder="10000"
            keyboardType="numeric"
            right={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Mô tả (tùy chọn)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Nhập mô tả timeline..."
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
    marginBottom: 8,
  },
  helperText: {
    marginTop: -8,
    marginBottom: 16,
    color: '#757575',
    fontSize: 12,
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

