import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Chip,
  Surface,
  Divider,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { bookingApi, BookingInformationResponse } from '../../services/api/endpoints/bookingApi';
import { managerBookingApi } from '../../services/api/endpoints/managerBookingApi';
import { CheckInBookingRequest, CheckoutBookingRequest } from '../../types';
import { keeperSlotApi, GetAvailableSlotsParams } from '../../services/api/endpoints/keeperSlotApi';
import { floorApi } from '../../services/api/endpoints/floorApi';
import { Floor, Booking } from '../../types';
import { format, parse } from 'date-fns';
import { DATE_FORMATS } from '../../utils/constants';

// Helper function to safely format dates
const safeFormatDate = (dateStr: string | undefined, formatPattern: string, displayFormat: string): string => {
  if (!dateStr) return 'Chưa có';
  try {
    const parsed = parse(dateStr, formatPattern, new Date());
    return isNaN(parsed.getTime()) ? 'Chưa có' : format(parsed, displayFormat);
  } catch {
    return 'Chưa có';
  }
};

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<BookingStackParamList, 'BookingDetail'>>();
  const { user } = useAuth();
  const toast = useToast();

  const bookingId = route.params?.bookingId || 0;
  const fallbackBooking = route.params?.booking; // Fallback data from list

  const [booking, setBooking] = useState<BookingInformationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingSlot, setIsChangingSlot] = useState(false);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [showConfirmChangeSlotDialog, setShowConfirmChangeSlotDialog] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (bookingId > 0) {
      loadBookingInfo();
    }
  }, [bookingId]);

  /**
   * Map Manager API Booking response to BookingInformationResponse format
   */
  const mapManagerBookingToKeeperFormat = (managerBooking: any): BookingInformationResponse => {
    // Manager API response structure (based on user description):
    // BookingId, StartTime, EndTime, CheckinTime, CheckoutTime
    // CustomerName, CustomerPhone, CustomerAvatar
    // GuestName, GuestPhone (nếu là passerby)
    // ParkingSlotName, FloorName, ParkingName
    // LicensePlate, VehicleName, Color
    // UnPaidMoney, TotalPrice
    
    return {
      id: managerBooking.id || managerBooking.bookingId || bookingId,
      parkingSlotId: managerBooking.parkingSlotId || 0,
      slotName: managerBooking.slotName || managerBooking.parkingSlotName || '',
      customerName: managerBooking.customerName || managerBooking.guestName || '',
      customerPhone: managerBooking.customerPhone || managerBooking.guestPhone || '',
      licensePlate: managerBooking.licensePlate || '',
      vehicleName: managerBooking.vehicleName || '',
      vehicleColor: managerBooking.vehicleColor || managerBooking.color || '',
      startTime: managerBooking.startTime || '',
      endTime: managerBooking.endTime || '',
      dateBook: managerBooking.dateBook || managerBooking.createdAt || '',
      status: (managerBooking.status as any) || 'Pending',
      createdAt: managerBooking.createdAt,
      updatedAt: managerBooking.updatedAt,
      checkinTime: managerBooking.checkinTime || null,
      checkoutTime: managerBooking.checkoutTime || null,
      totalPrice: managerBooking.totalPrice || null,
      unPaidMoney: managerBooking.unPaidMoney || null,
      paymentMethod: managerBooking.paymentMethod || null,
      parkingId: managerBooking.parkingId || (user as any)?.parkingId || 0,
    } as BookingInformationResponse;
  };

  const loadBookingInfo = async () => {
    setIsLoading(true);
    try {
      if (__DEV__) {
        try {
          // eslint-disable-next-line no-console
          console.log('[BookingDetail] fetching booking info via Manager API', { bookingId, hasFallback: !!fallbackBooking });
        } catch {}
      }
      
      // Use Manager API instead of Keeper API (works for all statuses)
      try {
        const managerBooking = await managerBookingApi.getBookingDetail(bookingId);
        if (__DEV__) {
          try {
            // eslint-disable-next-line no-console
            console.log('[BookingDetail] Manager API raw response:', JSON.stringify(managerBooking, null, 2));
          } catch {}
        }
        
        // Map Manager Booking format to Keeper BookingInformationResponse format
        const mappedBooking = mapManagerBookingToKeeperFormat(managerBooking);
        
        // Merge with fallback data if available (fallback might have additional fields)
        if (fallbackBooking) {
          setBooking({
            ...mappedBooking,
            // Use fallback for any missing fields
            slotName: mappedBooking.slotName || fallbackBooking.slotName || '',
            customerName: mappedBooking.customerName || fallbackBooking.customerName || '',
            customerPhone: mappedBooking.customerPhone || fallbackBooking.customerPhone || '',
            licensePlate: mappedBooking.licensePlate || fallbackBooking.licensePlate || '',
            vehicleName: mappedBooking.vehicleName || fallbackBooking.vehicleName || '',
            vehicleColor: mappedBooking.vehicleColor || fallbackBooking.vehicleColor || '',
          });
        } else {
          setBooking(mappedBooking);
        }
      } catch (apiError: any) {
        // If Manager API fails, use fallback data from list if available
        if (fallbackBooking) {
          if (__DEV__) {
            try {
              // eslint-disable-next-line no-console
              console.log('[BookingDetail] Manager API failed, using fallback booking data:', apiError?.message);
            } catch {}
          }
          
          // Map fallback booking to BookingInformationResponse format
          const mappedFallback: BookingInformationResponse = {
            id: fallbackBooking.id || fallbackBooking.bookingId || bookingId,
            parkingSlotId: fallbackBooking.parkingSlotId || 0,
            slotName: fallbackBooking.slotName || '',
            customerName: fallbackBooking.customerName || '',
            customerPhone: fallbackBooking.customerPhone || '',
            licensePlate: fallbackBooking.licensePlate || '',
            vehicleName: fallbackBooking.vehicleName || '',
            vehicleColor: fallbackBooking.vehicleColor || '',
            startTime: fallbackBooking.startTime || '',
            endTime: fallbackBooking.endTime || '',
            dateBook: fallbackBooking.dateBook || '',
            status: (fallbackBooking.status as any) || 'Pending',
            createdAt: fallbackBooking.createdAt,
            updatedAt: fallbackBooking.updatedAt,
            checkinTime: null,
            checkoutTime: null,
            totalPrice: null,
            unPaidMoney: null,
            paymentMethod: null,
          };
          setBooking(mappedFallback);
        } else {
          // No fallback - show error
          if (__DEV__) {
            try {
              // eslint-disable-next-line no-console
              console.log('[BookingDetail] Manager API error (no fallback):', apiError);
            } catch {}
          }
          toast.showError(apiError?.message || 'Không thể tải thông tin booking');
        }
      }
    } catch (error: any) {
      if (__DEV__) {
        try {
          // eslint-disable-next-line no-console
          console.log('[BookingDetail] loadBookingInfo unexpected error:', error);
        } catch {}
      }
      toast.showError(error?.message || 'Không thể tải thông tin booking');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFloors = async () => {
    const parkingId = (user as any)?.parkingId || 0;
    if (parkingId === 0) return;

    try {
      const floorsData = await floorApi.getFloorsByParking(parkingId);
      setFloors(floorsData);
      if (floorsData.length > 0 && !selectedFloorId) {
        setSelectedFloorId(floorsData[0].id);
      }
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách tầng');
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedFloorId || !booking) return;

    try {
      const startDateTime = booking.startTime;
      const endDateTime = booking.endTime;

      // Assume vehicleId = 1 (motorcycle) or 2 (car) - có thể lấy từ booking sau
      const vehicleId = 1; // Default

      const params: GetAvailableSlotsParams = {
        floorId: selectedFloorId,
        startTime: startDateTime,
        endTime: endDateTime,
        vehicleId: vehicleId,
      };

      const slots = await keeperSlotApi.getAvailableSlots(params);
      // Filter out current slot
      const filteredSlots = slots.filter((slot) => slot.id !== booking.parkingSlotId);
      setAvailableSlots(filteredSlots);
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách slot');
      setAvailableSlots([]);
    }
  };

  const handleChangeSlot = () => {
    if (!booking) return;
    setShowConfirmChangeSlotDialog(true);
  };

  const handleConfirmChangeSlot = () => {
    setShowConfirmChangeSlotDialog(false);
    setShowSlotSelection(true);
    loadFloors();
  };

  const handleConfirmSlotChange = async () => {
    if (!selectedSlotId || !booking) {
      toast.showError('Vui lòng chọn vị trí mới');
      return;
    }

    setIsChangingSlot(true);
    try {
      await keeperSlotApi.changeSlot({
        bookingId: booking.id,
        newSlotId: selectedSlotId,
      });
      toast.showSuccess('Đổi vị trí thành công');
      setShowSlotSelection(false);
      loadBookingInfo(); // Reload booking info
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể đổi slot');
    } finally {
      setIsChangingSlot(false);
    }
  };

  useEffect(() => {
    if (showSlotSelection && selectedFloorId && booking) {
      loadAvailableSlots();
    }
  }, [showSlotSelection, selectedFloorId, booking]);

  const handleCheckIn = async () => {
    if (!booking) return;

    setIsCheckingIn(true);
    try {
      await bookingApi.checkInBooking({ bookingId: booking.id });
      toast.showSuccess('Check-in thành công');
      loadBookingInfo(); // Reload to update status
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;

    // Get parkingId from booking or user
    const parkingId = booking.parkingId || (user as any)?.parkingId || 0;
    if (parkingId === 0) {
      toast.showError('Không tìm thấy thông tin bãi đỗ');
      return;
    }

    setIsCheckingOut(true);
    try {
      const checkoutData: CheckoutBookingRequest = {
        bookingId: booking.id,
        parkingId: parkingId,
        totalPrice: booking.totalPrice || null,
        paymentMethod: booking.paymentMethod || null,
      };

      await managerBookingApi.checkoutBooking(checkoutData);
      toast.showSuccess('Check-out thành công');
      loadBookingInfo(); // Reload to update status
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể check-out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
      case 'Check_Out':
      case 'Success':
        return '#4caf50';
      case 'Cancel':
      case 'Cancelled':
        return '#f44336';
      case 'Pending':
      case 'Booked':
        return '#ff9800';
      case 'Confirmed':
      case 'Check_In':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
      case 'Success':
        return 'Hoàn thành';
      case 'Check_Out':
        return 'Đã check-out';
      case 'Check_In':
        return 'Đã check-in';
      case 'Cancel':
      case 'Cancelled':
        return 'Đã hủy';
      case 'Pending':
      case 'Booked':
        return 'Chờ duyệt';
      case 'Confirmed':
        return 'Đã xác nhận';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Text>Không tìm thấy thông tin booking</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Booking Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.bookingId}>
              Đặt chỗ #{booking.id}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
              textStyle={{ color: '#fff' }}
            >
              {getStatusLabel(booking.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Customer Info */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin khách hàng
            </Text>
            <InfoRow label="Tên" value={booking.customerName || 'Chưa có'} />
            <InfoRow label="Số điện thoại" value={booking.customerPhone || 'Chưa có'} />
          </View>

          <Divider style={styles.divider} />

          {/* Vehicle Info */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin xe
            </Text>
            <InfoRow label="Biển số" value={booking.licensePlate || 'Chưa có'} />
            <InfoRow label="Tên xe" value={booking.vehicleName || 'Chưa có'} />
            <InfoRow label="Màu xe" value={booking.vehicleColor || 'Chưa có'} />
          </View>

          <Divider style={styles.divider} />

          {/* Booking Details */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chi tiết booking
            </Text>
            <InfoRow label="Vị trí" value={booking.slotName || 'Chưa có'} />
            <InfoRow
              label="Ngày đặt"
              value={safeFormatDate(booking.dateBook, 'yyyy-MM-dd', DATE_FORMATS.DISPLAY)}
            />
            <InfoRow
              label="Giờ bắt đầu"
              value={safeFormatDate(booking.startTime, "yyyy-MM-dd'T'HH:mm:ss", 'HH:mm')}
            />
            <InfoRow
              label="Giờ kết thúc"
              value={safeFormatDate(booking.endTime, "yyyy-MM-dd'T'HH:mm:ss", 'HH:mm')}
            />
            <InfoRow
              label="Giờ vào"
              value={safeFormatDate(booking.checkinTime || undefined, "yyyy-MM-dd'T'HH:mm:ss", 'HH:mm')}
            />
            <InfoRow
              label="Giờ ra"
              value={safeFormatDate(booking.checkoutTime || undefined, "yyyy-MM-dd'T'HH:mm:ss", 'HH:mm')}
            />
            <InfoRow
              label="Phương thức thanh toán"
              value={booking.paymentMethod ? String(booking.paymentMethod) : 'Chưa có'}
            />
            <InfoRow
              label="Tổng tiền"
              value={booking.totalPrice != null ? String(booking.totalPrice) : 'Chưa có'}
            />
            <InfoRow
              label="Tiền chưa thanh toán"
              value={booking.unPaidMoney != null ? String(booking.unPaidMoney) : '0'}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      {!showSlotSelection && booking && (
        <Card style={styles.card}>
          <Card.Content>
            {/* Check-in button: Show when status is Success or Booked */}
            {(booking.status === 'Success' || booking.status === 'Booked') && (
              <Button
                mode="contained"
                onPress={handleCheckIn}
                style={styles.actionButton}
                buttonColor="#2196f3"
                icon="login"
                loading={isCheckingIn}
                disabled={isCheckingIn}
              >
                Check-in
              </Button>
            )}

            {/* Check-out button: Show when status is Check_In, OverTime, or Check_Out */}
            {(booking.status === 'Check_In' || 
              booking.status === 'OverTime' || 
              booking.status === 'Check_Out') && (
              <Button
                mode="contained"
                onPress={handleCheckOut}
                style={styles.actionButton}
                buttonColor="#4caf50"
                icon="logout"
                loading={isCheckingOut}
                disabled={isCheckingOut}
              >
                Check-out
              </Button>
            )}

            {/* Change slot button: Show for all statuses */}
            <Button
              mode="outlined"
              onPress={handleChangeSlot}
              style={styles.actionButton}
              icon="swap-horizontal"
              disabled={isCheckingIn || isCheckingOut}
            >
              Đổi vị trí
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Slot Selection */}
      {showSlotSelection && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chọn vị trí mới
            </Text>

            {/* Floor Selection */}
            <View style={styles.floorContainer}>
              <Text variant="bodyMedium" style={styles.label}>
                Tầng
              </Text>
              <View style={styles.chipContainer}>
                {floors.map((floor) => (
                  <Chip
                    key={floor.id}
                    selected={selectedFloorId === floor.id}
                    onPress={() => setSelectedFloorId(floor.id)}
                    style={styles.chip}
                    selectedColor="#6200ee"
                  >
                    {floor.name}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Available Slots */}
            {selectedFloorId && (
              <View style={styles.slotContainer}>
                <Text variant="bodyMedium" style={styles.label}>
                  Slot khả dụng
                </Text>
                {availableSlots.length === 0 ? (
                  <Text variant="bodySmall" style={styles.errorText}>
                    Không có vị trí khả dụng
                  </Text>
                ) : (
                  <View style={styles.slotGrid}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.id}
                        selected={selectedSlotId === slot.id}
                        onPress={() => setSelectedSlotId(slot.id)}
                        style={[
                          styles.slotChip,
                          selectedSlotId === slot.id && styles.slotChipSelected,
                        ]}
                        selectedColor="#fff"
                      >
                        {slot.name}
                      </Chip>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowSlotSelection(false);
                  setSelectedSlotId(null);
                }}
                style={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmSlotChange}
                loading={isChangingSlot}
                disabled={!selectedSlotId || isChangingSlot}
                style={styles.confirmButton}
                buttonColor="#4caf50"
              >
                Xác nhận
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Confirm Change Slot Dialog */}
      <Portal>
        <Dialog
          visible={showConfirmChangeSlotDialog}
          onDismiss={() => setShowConfirmChangeSlotDialog(false)}
        >
          <Dialog.Title>Đổi vị trí</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Bạn có chắc chắn muốn đổi slot cho booking này không?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmChangeSlotDialog(false)}>
              Hủy
            </Button>
            <Button
              onPress={handleConfirmChangeSlot}
              mode="contained"
              buttonColor="#ff9800"
            >
              Xác nhận
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.infoLabel}>
        {label}:
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue}>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingId: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '500',
    color: '#757575',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    color: '#212121',
  },
  actionButton: {
    marginTop: 8,
  },
  floorContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  slotContainer: {
    marginBottom: 16,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  slotChip: {
    backgroundColor: '#e0e0e0',
  },
  slotChipSelected: {
    backgroundColor: '#4caf50',
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
