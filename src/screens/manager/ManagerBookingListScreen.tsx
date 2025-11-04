import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Searchbar,
  SegmentedButtons,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getBookingsByManager,
  setFilters,
  clearError,
  clearFilters,
} from '../../store/slices/managerBookingSlice';
import { Booking, BookingStatus } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';
import { format } from 'date-fns';

export default function ManagerBookingListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { bookings, isLoading, error, filters, pagination } = useSelector(
    (state: RootState) => state.managerBooking
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  useEffect(() => {
    // Reload when filters change
    if (user?.id) {
      loadBookings();
    }
  }, [filters]);

  const loadBookings = useCallback(() => {
    if (user?.id) {
      dispatch(
        getBookingsByManager({
          managerId: user.id,
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
        })
      );
    }
  }, [dispatch, user?.id, pagination.pageNo, pagination.pageSize]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(setFilters({ ...filters, status: selectedStatus !== 'ALL' ? selectedStatus : undefined }));
    loadBookings().finally(() => {
      setRefreshing(false);
    });
  }, [loadBookings, filters, selectedStatus]);

  const handleStatusChange = (status: BookingStatus | 'ALL') => {
    setSelectedStatus(status);
    dispatch(
      setFilters({
        ...filters,
        status: status !== 'ALL' ? status : undefined,
      })
    );
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('ManagerBookingDetail' as never, { bookingId: booking.id } as never);
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#ff9800'; // Orange
      case BookingStatus.CONFIRMED:
        return '#2196f3'; // Blue
      case BookingStatus.IN_PROGRESS:
        return '#4caf50'; // Green
      case BookingStatus.COMPLETED:
        return '#4caf50'; // Green
      case BookingStatus.CANCELLED:
        return '#f44336'; // Red
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

  const filteredBookings = bookings.filter((booking) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        booking.customerName?.toLowerCase().includes(query) ||
        booking.licensePlate?.toLowerCase().includes(query) ||
        booking.customerPhone?.toLowerCase().includes(query) ||
        booking.slotName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity onPress={() => handleBookingPress(item)}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.bookingId}>
              #{item.id}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.chipText}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Khách hàng:</Text>
            <Text variant="bodyMedium">{item.customerName || 'Chưa có'}</Text>
          </View>
          {item.licensePlate && (
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Biển số:</Text>
              <Text variant="bodyMedium">{item.licensePlate}</Text>
            </View>
          )}
          {item.slotName && (
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Vị trí:</Text>
              <Text variant="bodyMedium">{item.slotName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Thời gian:</Text>
            <Text variant="bodySmall">
              {(() => {
                try {
                  const start = parse(item.startTime, "yyyy-MM-dd'T'HH:mm:ss", new Date());
                  return isNaN(start.getTime()) ? 'Chưa có' : format(start, 'dd/MM/yyyy HH:mm');
                } catch { return 'Chưa có'; }
              })()} - {(() => {
                try {
                  const end = parse(item.endTime, "yyyy-MM-dd'T'HH:mm:ss", new Date());
                  return isNaN(end.getTime()) ? 'Chưa có' : format(end, 'HH:mm');
                } catch { return 'Chưa có'; }
              })()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách đặt chỗ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Tìm kiếm theo tên, SĐT, biển số..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Lọc theo trạng thái:
            </Text>
            <SegmentedButtons
              value={selectedStatus}
              onValueChange={handleStatusChange}
              buttons={[
                { value: 'ALL', label: 'Tất cả' },
                { value: BookingStatus.PENDING, label: 'Chờ duyệt' },
                { value: BookingStatus.CONFIRMED, label: 'Đã duyệt' },
                { value: BookingStatus.IN_PROGRESS, label: 'Đang đỗ' },
                { value: BookingStatus.COMPLETED, label: 'Hoàn thành' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `manager-booking-${index}`)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {searchQuery || selectedStatus !== 'ALL'
                  ? 'Không tìm thấy booking phù hợp'
                  : 'Chưa có booking nào'}
              </Text>
            </Card.Content>
          </Card>
        }
      />
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
  filterCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    marginBottom: 16,
  },
  filterSection: {
    marginTop: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#757575',
    minWidth: 100,
  },
  emptyCard: {
    marginTop: 32,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
});

