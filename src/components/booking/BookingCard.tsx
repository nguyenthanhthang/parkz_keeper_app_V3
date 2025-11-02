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
      return '#FF9800';
    case BookingStatus.CONFIRMED:
      return '#2196F3';
    case BookingStatus.IN_PROGRESS:
      return '#4CAF50';
    case BookingStatus.COMPLETED:
      return '#9E9E9E';
    case BookingStatus.CANCELLED:
      return '#F44336';
    default:
      return '#757575';
  }
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const statusColor = getStatusColor(booking.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              Booking #{booking.id}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text
                variant="labelSmall"
                style={[styles.statusText, { color: statusColor }]}
              >
                {booking.status}
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
                Slot:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {booking.slotName}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text variant="bodySmall" style={styles.label}>
              Ngày đặt:
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {formatDate(booking.dateBook)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodySmall" style={styles.label}>
              Thời gian:
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
            </Text>
          </View>

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

