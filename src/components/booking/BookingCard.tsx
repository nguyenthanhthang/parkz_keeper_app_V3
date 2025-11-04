import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { GetAllBookingByKeeperIdResponse, BookingStatus } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';

interface BookingCardProps {
  booking: GetAllBookingByKeeperIdResponse;
  onPress?: () => void;
}

const getStatusColor = (status: BookingStatus | string): string => {
  switch (status) {
    case BookingStatus.PENDING:
    case 'Pending':
      return '#ff9800';
    case BookingStatus.CONFIRMED:
    case 'Confirmed':
    case 'Check_In':
      return '#2196f3';
    case BookingStatus.IN_PROGRESS:
      return '#4caf50';
    case BookingStatus.COMPLETED:
    case 'Check_Out':
    case 'Success':
      return '#4caf50';
    case BookingStatus.CANCELLED:
    case 'Cancel':
    case 'Cancelled':
      return '#f44336';
    default:
      return '#757575';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'Chờ duyệt';
    case 'Confirmed':
      return 'Đã xác nhận';
    case 'Check_In':
      return 'Đã check-in';
    case 'Check_Out':
      return 'Đã check-out';
    case 'Success':
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancel':
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || '—';
  }
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const statusColor = getStatusColor(booking.status);
  const displayId = (booking as any)?.id ?? (booking as any)?.bookingId ?? (booking as any)?.bookingCode ?? '—';
  if (__DEV__) {
    try {
      // eslint-disable-next-line no-console
      console.log('[BookingCard] render', { id: (booking as any)?.id, bookingId: (booking as any)?.bookingId, bookingCode: (booking as any)?.bookingCode, displayId });
    } catch {}
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              Đặt chỗ #{displayId}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text
                variant="labelSmall"
                style={[styles.statusText, { color: statusColor }]}
              >
                {getStatusLabel(String(booking.status))}
              </Text>
            </View>
          </View>

          {booking.customerName && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                Khách hàng:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {booking.customerName}
              </Text>
            </View>
          )}

          {booking.licensePlate && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                Biển số:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {booking.licensePlate}
              </Text>
            </View>
          )}

          {booking.slotName && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                Vị trí:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {booking.slotName}
              </Text>
            </View>
          )}

          {booking.dateBook && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                Ngày đặt:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatDate(booking.dateBook)}
              </Text>
            </View>
          )}

          {(booking.startTime || booking.endTime) && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                Thời gian:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatDateTime(booking.startTime || '')} - {formatDateTime(booking.endTime || '')}
              </Text>
            </View>
          )}

          {booking.customerPhone && (
            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                SĐT:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {booking.customerPhone}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
  },
  label: {
    color: '#757575',
    width: 80,
  },
  value: {
    flex: 1,
    fontWeight: '500',
  },
});

