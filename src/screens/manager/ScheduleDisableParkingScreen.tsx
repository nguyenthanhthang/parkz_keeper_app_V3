import React, { useState } from 'react';
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
  disableParkingByDate,
  disableParkingByDateTime,
  clearError,
} from '../../store/slices/parkingSlice';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

export default function ScheduleDisableParkingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'ScheduleDisable'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.parking);

  const parkingId = route.params?.parkingId || 0;

  const [scheduleType, setScheduleType] = useState<'date' | 'datetime'>('date');
  const [startDateStr, setStartDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDateStr, setEndDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTimeStr, setStartTimeStr] = useState(format(new Date(), 'HH:mm'));
  const [endTimeStr, setEndTimeStr] = useState(format(new Date(), 'HH:mm'));
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const validateDate = (dateStr: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const validateTime = (timeStr: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
  };

  const handleSubmit = async () => {
    if (!parkingId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin bãi đỗ');
      return;
    }

    if (!validateDate(startDateStr)) {
      Alert.alert('Lỗi', 'Ngày bắt đầu không hợp lệ (định dạng: yyyy-MM-dd)');
      return;
    }

    if (!validateDate(endDateStr)) {
      Alert.alert('Lỗi', 'Ngày kết thúc không hợp lệ (định dạng: yyyy-MM-dd)');
      return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (endDate < startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    if (scheduleType === 'datetime') {
      if (!validateTime(startTimeStr)) {
        Alert.alert('Lỗi', 'Giờ bắt đầu không hợp lệ (định dạng: HH:mm)');
        return;
      }

      if (!validateTime(endTimeStr)) {
        Alert.alert('Lỗi', 'Giờ kết thúc không hợp lệ (định dạng: HH:mm)');
        return;
      }

      const startDateTime = new Date(startDate);
      const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0);

      const endDateTime = new Date(endDate);
      const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0);

      if (endDateTime <= startDateTime) {
        Alert.alert('Lỗi', 'Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
    }

    try {
      if (scheduleType === 'date') {
        await dispatch(
          disableParkingByDate({
            parkingId,
            startDate: startDateStr,
            endDate: endDateStr,
            reason: reason.trim() || undefined,
          })
        ).unwrap();
      } else {
        await dispatch(
          disableParkingByDateTime({
            parkingId,
            startDate: startDateStr,
            endDate: endDateStr,
            startTime: `${startTimeStr}:00`,
            endTime: `${endTimeStr}:00`,
            reason: reason.trim() || undefined,
          })
        ).unwrap();
      }

      Alert.alert(
        'Thành công',
        'Đã lên lịch vô hiệu hóa bãi đỗ thành công',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lên lịch vô hiệu hóa bãi đỗ');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Lên lịch vô hiệu hóa bãi đỗ
          </Text>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.label}>
              Loại lịch trình
            </Text>
            <SegmentedButtons
              value={scheduleType}
              onValueChange={(value) => setScheduleType(value as 'date' | 'datetime')}
              buttons={[
                {
                  value: 'date',
                  label: 'Theo ngày',
                },
                {
                  value: 'datetime',
                  label: 'Theo ngày và giờ',
                },
              ]}
            />
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.label}>
              Ngày bắt đầu *
            </Text>
            <TextInput
              mode="outlined"
              value={startDateStr}
              onChangeText={setStartDateStr}
              placeholder="yyyy-MM-dd"
              keyboardType="default"
              style={styles.textInput}
              right={<TextInput.Icon icon="calendar" />}
            />
            <Text variant="bodySmall" style={styles.helperText}>
              Định dạng: yyyy-MM-dd (ví dụ: 2024-12-31)
            </Text>
          </View>

          {scheduleType === 'datetime' && (
            <View style={styles.section}>
              <Text variant="bodyMedium" style={styles.label}>
                Giờ bắt đầu *
              </Text>
              <TextInput
                mode="outlined"
                value={startTimeStr}
                onChangeText={setStartTimeStr}
                placeholder="HH:mm"
                keyboardType="default"
                style={styles.textInput}
                right={<TextInput.Icon icon="clock" />}
              />
              <Text variant="bodySmall" style={styles.helperText}>
                Định dạng: HH:mm (ví dụ: 08:00)
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.label}>
              Ngày kết thúc *
            </Text>
            <TextInput
              mode="outlined"
              value={endDateStr}
              onChangeText={setEndDateStr}
              placeholder="yyyy-MM-dd"
              keyboardType="default"
              style={styles.textInput}
              right={<TextInput.Icon icon="calendar" />}
            />
            <Text variant="bodySmall" style={styles.helperText}>
              Định dạng: yyyy-MM-dd (ví dụ: 2024-12-31)
            </Text>
          </View>

          {scheduleType === 'datetime' && (
            <View style={styles.section}>
              <Text variant="bodyMedium" style={styles.label}>
                Giờ kết thúc *
              </Text>
              <TextInput
                mode="outlined"
                value={endTimeStr}
                onChangeText={setEndTimeStr}
                placeholder="HH:mm"
                keyboardType="default"
                style={styles.textInput}
                right={<TextInput.Icon icon="clock" />}
              />
              <Text variant="bodySmall" style={styles.helperText}>
                Định dạng: HH:mm (ví dụ: 18:00)
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.label}>
              Lý do (tùy chọn)
            </Text>
            <TextInput
              mode="outlined"
              value={reason}
              onChangeText={setReason}
              placeholder="Nhập lý do vô hiệu hóa..."
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </View>

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
              Lên lịch
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
  section: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#212121',
  },
  dateButton: {
    marginTop: 8,
  },
  textInput: {
    marginTop: 8,
  },
  helperText: {
    marginTop: 4,
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

