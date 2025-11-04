import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import BookingCard from '../../components/booking/BookingCard';
import BookingSearch from '../../components/booking/BookingSearch';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { GetAllBookingByKeeperIdResponse } from '../../services/api/endpoints/bookingApi';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

export default function BookingListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();
  const {
    bookings,
    isLoading,
    error,
    pagination,
    getAllBookings,
    searchBookings,
    resetBookings,
    clearError,
  } = useBooking();

  const [searchString, setSearchString] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GetAllBookingByKeeperIdResponse[]>([]);

  const keeperId = user?.id || 0;

  // Load bookings on mount
  useEffect(() => {
    if (keeperId > 0) {
      resetBookings();
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keeperId]); // loadBookings được memoize và chỉ phụ thuộc vào keeperId

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearError();
    }
  }, [error, clearError, toast]);

  const loadBookings = useCallback(
    (pageNo: number = 1) => {
      if (keeperId > 0) {
        getAllBookings(keeperId, pageNo, DEFAULT_PAGE_SIZE);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [keeperId] // getAllBookings là stable function từ Redux dispatch
  );

  const handleRefresh = useCallback(() => {
    resetBookings();
    loadBookings(1);
    setSearchString('');
    setIsSearching(false);
    setSearchResults([]);
  }, [loadBookings, resetBookings]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && pagination.hasMore && !isSearching && keeperId > 0) {
      loadBookings(pagination.pageNo + 1);
    }
  }, [isLoading, pagination, isSearching, keeperId, loadBookings]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchString(text);

      if (text.trim().length === 0) {
        setIsSearching(false);
        handleRefresh();
        return;
      }

      if (text.trim().length >= 2 && keeperId > 0) {
        setIsSearching(true);
        // Dispatch search action - results will be in booking.searchResults
        searchBookings(keeperId, text.trim());
      } else {
        setIsSearching(false);
      }
    },
    [keeperId, searchBookings, handleRefresh]
  );

  // Update isSearching state when searchResults change
  useEffect(() => {
    if (searchResults.length > 0 && searchString.length >= 2) {
      setIsSearching(true);
    }
  }, [searchResults, searchString]);

  const handleBookingPress = (booking: any) => {
    const id = booking?.id ?? booking?.bookingId ?? booking?.bookingCode;
    if (__DEV__) {
      try {
        // Debug log for booked item and resolved id
        // eslint-disable-next-line no-console
        console.log('[BookingList] onPress booking item:', {
          id: booking?.id,
          bookingId: booking?.bookingId,
          bookingCode: booking?.bookingCode,
          resolvedId: id,
        });
      } catch {}
    }
    if (!id) {
      toast.showError('Không tìm thấy mã đặt chỗ');
      return;
    }
    // Pass full booking object as fallback for bookings that haven't checked in yet
    navigation.navigate('BookingDetail' as never, { bookingId: id, booking } as never);
  };

  const handleCreateBooking = () => {
    navigation.navigate('CreatePasserbyBooking' as never);
  };

  if (keeperId === 0) {
    return (
      <View style={styles.container}>
        <Text>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  // Convert search results to booking format
  const displayData = isSearching && searchString.length > 0 && searchResults.length > 0
    ? searchResults.map((result: any) => ({
        id: result.bookingId || result.id,
        parkingSlotId: result.parkingSlotId || 0,
        slotName: result.slotName,
        customerName: result.customerName,
        customerPhone: result.customerPhone,
        licensePlate: result.licensePlate,
        vehicleName: result.vehicleName,
        vehicleColor: result.vehicleColor,
        startTime: result.startTime || '',
        endTime: result.endTime || '',
        dateBook: result.dateBook || '',
        status: result.status || 'Pending',
        createdAt: result.createdAt,
      }))
    : bookings;

  // Debug log current list data
  if (__DEV__) {
    try {
      const sample = (displayData || []).slice(0, 5).map((b: any) => ({
        id: b?.id,
        bookingId: b?.bookingId,
        bookingCode: b?.bookingCode,
        slotName: b?.slotName,
      }));
      // eslint-disable-next-line no-console
      console.log('[BookingList] displayData sample:', sample);
    } catch {}
  }

  return (
    <View style={styles.container}>
      <BookingSearch
        value={searchString}
        onChangeText={handleSearch}
        onClear={() => {
          setSearchString('');
          setIsSearching(false);
          handleRefresh();
        }}
      />

      {isLoading && bookings.length === 0 ? (
        <Loading message="Đang tải danh sách booking..." />
      ) : displayData.length === 0 ? (
        <EmptyState
          icon="calendar-remove"
          title={isSearching ? 'Không tìm thấy booking' : 'Chưa có booking nào'}
          message={
            isSearching
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Bạn chưa có booking nào được gán cho bạn'
          }
          actionLabel={!isSearching ? 'Tạo booking mới' : undefined}
          onAction={!isSearching ? handleCreateBooking : undefined}
        />
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `booking-${index}`)}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading && bookings.length > 0} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && bookings.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateBooking}
        label="Tạo đặt chỗ"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 80,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
