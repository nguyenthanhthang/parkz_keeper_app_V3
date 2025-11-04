import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ManagerBookingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getBookingDetail,
  approveBooking,
  checkoutBooking,
  markBookingDone,
  clearError,
  setCurrentBooking,
} from '../../store/slices/managerBookingSlice';
import { Booking, BookingStatus } from '../../types';
import { format } from 'date-fns';

export default function ManagerBookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ManagerBookingStackParamList, 'ManagerBookingDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { currentBooking, isLoading, error } = useSelector(
    (state: RootState) => state.managerBooking
  );

  const bookingId = route.params?.bookingId || 0;

  useEffect(() => {
    if (bookingId > 0) {
      dispatch(getBookingDetail(bookingId));
    }
    return () => {
      dispatch(setCurrentBooking(null));
    };
  }, [bookingId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#ff9800';
      case BookingStatus.CONFIRMED:
        return '#2196f3';
      case BookingStatus.IN_PROGRESS:
        return '#4caf50';
      case BookingStatus.COMPLETED:
        return '#4caf50';
      case BookingStatus.CANCELLED:
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Chờ duyệt';
      case BookingStatus.CONFIRMED:
        return 'Đã duyệt';
      case BookingStatus.IN_PROGRESS:
        return 'Đang đỗ';
      case BookingStatus.COMPLETED:
        return 'Hoàn thành';
      case BookingStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleApprove = () => {
    if (!currentBooking) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn duyệt booking này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              await dispatch(approveBooking({ bookingId: currentBooking.id })).unwrap();
              toast.showSuccess('Đã duyệt booking thành công');
              dispatch(getBookingDetail(bookingId));
            } catch (err: any) {
              toast.showError(err.message || 'Không thể duyệt booking');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!currentBooking) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn check-out booking này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Check-out',
          onPress: async () => {
            try {
              await dispatch(checkoutBooking({ bookingId: currentBooking.id })).unwrap();
              toast.showSuccess('Đã check-out booking thành công');
              dispatch(getBookingDetail(bookingId));
            } catch (err: any) {
              toast.showError(err.message || 'Không thể check-out booking');
            }
          },
        },
      ]
    );
  };

  const handleMarkDone = () => {
    if (!currentBooking) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đánh dấu booking này đã hoàn thành?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            try {
              await dispatch(markBookingDone({ bookingId: currentBooking.id })).unwrap();
              toast.showSuccess('Đã đánh dấu booking hoàn thành');
              dispatch(getBookingDetail(bookingId));
            } catch (err: any) {
              toast.showError(err.message || 'Không thể đánh dấu booking hoàn thành');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !currentBooking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thông tin booking...</Text>
      </View>
    );
  }

  if (!currentBooking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy booking</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  const canApprove = currentBooking.status === BookingStatus.PENDING;
  const canCheckout =
    currentBooking.status === BookingStatus.CONFIRMED ||
    currentBooking.status === BookingStatus.IN_PROGRESS;
  const canMarkDone = currentBooking.status === BookingStatus.IN_PROGRESS;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.bookingId}>
              Đặt chỗ #{currentBooking.id}
            </Text>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(currentBooking.status) },
              ]}
              textStyle={styles.chipText}
            >
              {getStatusLabel(currentBooking.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin khách hàng
            </Text>
            <InfoRow label="Tên" value={currentBooking.customerName || 'N/A'} />
            <InfoRow label="SĐT" value={currentBooking.customerPhone || 'N/A'} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin xe
            </Text>
            <InfoRow label="Biển số" value={currentBooking.licensePlate || 'N/A'} />
            <InfoRow label="Tên xe" value={currentBooking.vehicleName || 'N/A'} />
            <InfoRow label="Màu xe" value={currentBooking.vehicleColor || 'N/A'} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin đặt chỗ
            </Text>
            <InfoRow label="Vị trí" value={currentBooking.slotName || `#${currentBooking.parkingSlotId}`} />
            <InfoRow
              label="Ngày đặt"
              value={format(new Date(currentBooking.dateBook), 'dd/MM/yyyy')}
            />
            <InfoRow
              label="Thời gian"
              value={`${format(new Date(currentBooking.startTime), 'dd/MM/yyyy HH:mm')} - ${format(
                new Date(currentBooking.endTime),
                'HH:mm'
              )}`}
            />
            {currentBooking.createdAt && (
              <InfoRow
                label="Tạo lúc"
                value={format(new Date(currentBooking.createdAt), 'dd/MM/yyyy HH:mm')}
              />
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        {canApprove && (
          <Button
            mode="contained"
            onPress={handleApprove}
            style={styles.actionButton}
            icon="check-circle"
            disabled={isLoading}
            loading={isLoading}
          >
            Duyệt booking
          </Button>
        )}

        {canCheckout && (
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.actionButton}
            icon="exit-run"
            disabled={isLoading}
            loading={isLoading}
          >
            Check-out
          </Button>
        )}

        {canMarkDone && (
          <Button
            mode="contained"
            onPress={handleMarkDone}
            style={styles.actionButton}
            icon="check-all"
            disabled={isLoading}
            loading={isLoading}
          >
            Đánh dấu hoàn thành
          </Button>
        )}

        {!canApprove && !canCheckout && !canMarkDone && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.infoText}>
                Booking này không thể thực hiện thao tác nào. Trạng thái: {getStatusLabel(currentBooking.status)}
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}:
      </Text>
      <Text variant="bodyLarge" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingId: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 32,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    color: '#757575',
    fontWeight: '500',
    minWidth: 120,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: '#212121',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  infoCard: {
    marginTop: 8,
    backgroundColor: '#e3f2fd',
  },
  infoText: {
    textAlign: 'center',
    color: '#1976d2',
  },
});

