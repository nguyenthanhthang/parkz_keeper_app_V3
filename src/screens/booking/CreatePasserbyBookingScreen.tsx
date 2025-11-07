import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { bookingApi } from '../../services/api/endpoints/bookingApi';
import { keeperSlotApi, GetAvailableSlotsParams } from '../../services/api/endpoints/keeperSlotApi';
import { floorApi } from '../../services/api/endpoints/floorApi';
import { Floor } from '../../types';
import { CreateBookingForPasserbyRequest } from '../../types';
import { format, parse, addHours } from 'date-fns';
import { DATE_FORMATS } from '../../utils/constants';

// Vehicle Types (Hardcoded - có thể lấy từ API sau)
const VEHICLE_TYPES = [
  { id: 1, name: 'Xe máy', code: 'MOTORCYCLE' },
  { id: 2, name: 'Xe ô tô', code: 'CAR' },
];

export default function CreatePasserbyBookingScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1); // Default: Xe máy
  const [dateBook, setDateBook] = useState(format(new Date(), DATE_FORMATS.API));
  const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));
  const [endTime, setEndTime] = useState(format(addHours(new Date(), 2), 'HH:mm'));

  // Data state
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // UI state
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parkingId = (user as any)?.parkingId || 0;

  // Load floors on mount
  useEffect(() => {
    if (parkingId > 0) {
      loadFloors();
    }
  }, [parkingId]);

  // Load available slots when floor and vehicle selected
  useEffect(() => {
    if (selectedFloorId && selectedVehicleId && dateBook && startTime && endTime) {
      loadAvailableSlots();
    }
  }, [selectedFloorId, selectedVehicleId, dateBook, startTime, endTime]);

  const loadFloors = async () => {
    if (parkingId === 0) return;
    
    setIsLoadingFloors(true);
    try {
      const floorsData = await floorApi.getFloorsByParking(parkingId);
      setFloors(floorsData);
      if (floorsData.length > 0 && !selectedFloorId) {
        setSelectedFloorId(floorsData[0].id);
      }
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách tầng');
    } finally {
      setIsLoadingFloors(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedFloorId || !selectedVehicleId || !dateBook || !startTime || !endTime) {
      return;
    }

    setIsLoadingSlots(true);
    try {
      const startDateTime = `${dateBook}T${startTime}:00`;
      const endDateTime = `${dateBook}T${endTime}:00`;

      const params: GetAvailableSlotsParams = {
        floorId: selectedFloorId,
        startTime: startDateTime,
        endTime: endDateTime,
        vehicleId: selectedVehicleId,
      };

      const slots = await keeperSlotApi.getAvailableSlotsForPasserby(params);
      setAvailableSlots(slots);
      setSelectedSlotId(null); // Reset selected slot
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách slot');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validateForm = (): boolean => {
    if (!guestName.trim()) {
      toast.showError('Vui lòng nhập tên khách hàng');
      return false;
    }
    if (!guestPhone.trim()) {
      toast.showError('Vui lòng nhập số điện thoại');
      return false;
    }
    // Validate phone (basic)
    if (guestPhone.trim().length < 10) {
      toast.showError('Số điện thoại không hợp lệ');
      return false;
    }
    if (!licensePlate.trim()) {
      toast.showError('Vui lòng nhập biển số xe');
      return false;
    }
    if (!selectedFloorId) {
      toast.showError('Vui lòng chọn tầng');
      return false;
    }
    if (!selectedSlotId) {
      toast.showError('Vui lòng chọn vị trí');
      return false;
    }
    if (!dateBook) {
      toast.showError('Vui lòng chọn ngày đặt');
      return false;
    }
    if (!startTime || !endTime) {
      toast.showError('Vui lòng nhập giờ bắt đầu và kết thúc');
      return false;
    }
    
    // Validate time range
    const start = parse(`${dateBook} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(`${dateBook} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    if (end <= start) {
      toast.showError('Giờ kết thúc phải sau giờ bắt đầu');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!selectedSlotId) {
      toast.showError('Vui lòng chọn vị trí');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = `${dateBook}T${startTime}:00`;
      const endDateTime = `${dateBook}T${endTime}:00`;

      // Format theo API spec từ KEEPER_ALL_APIs.md
      // API expects: parkingSlotId, vehicleId, startTime, endTime, guestName, guestPhone, guestLicensePlate
      const request: CreateBookingForPasserbyRequest = {
        parkingSlotId: selectedSlotId,
        vehicleId: selectedVehicleId,
        startTime: startDateTime,
        endTime: endDateTime,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestLicensePlate: licensePlate.trim(),
      };

      const bookingId = await bookingApi.createPasserbyBooking(request);
      toast.showSuccess(`Tạo booking thành công! Mã booking: #${bookingId}`);
      navigation.goBack();
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tạo booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Guest Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Thông tin khách hàng
            </Text>
            
            <TextInput
              label="Tên khách hàng *"
              value={guestName}
              onChangeText={setGuestName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Số điện thoại *"
              value={guestPhone}
              onChangeText={setGuestPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Thông tin xe
            </Text>

            <View style={styles.vehicleTypeContainer}>
              <Text variant="bodyMedium" style={styles.label}>
                Loại xe *
              </Text>
              <View style={styles.chipContainer}>
                {VEHICLE_TYPES.map((type) => (
                  <Chip
                    key={type.id}
                    selected={selectedVehicleId === type.id}
                    onPress={() => setSelectedVehicleId(type.id)}
                    style={styles.chip}
                    selectedColor="#6200ee"
                  >
                    {type.name}
                  </Chip>
                ))}
              </View>
            </View>

            <TextInput
              label="Biển số xe *"
              value={licensePlate}
              onChangeText={setLicensePlate}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Tên xe (tùy chọn)"
              value={vehicleName}
              onChangeText={setVehicleName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Màu xe (tùy chọn)"
              value={vehicleColor}
              onChangeText={setVehicleColor}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Booking Time */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Thời gian đặt chỗ
            </Text>

            <TextInput
              label="Ngày đặt *"
              value={format(parse(dateBook, 'yyyy-MM-dd', new Date()), DATE_FORMATS.DISPLAY)}
              mode="outlined"
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
              placeholder="yyyy-MM-dd"
            />

            <View style={styles.timeRow}>
              <TextInput
                label="Giờ bắt đầu *"
                value={startTime}
                onChangeText={setStartTime}
                mode="outlined"
                placeholder="HH:mm"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Giờ kết thúc *"
                value={endTime}
                onChangeText={setEndTime}
                mode="outlined"
                placeholder="HH:mm"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Floor & Slot Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Chọn vị trí
            </Text>

            {/* Floor Selection */}
            <View style={styles.floorContainer}>
              <Text variant="bodyMedium" style={styles.label}>
                Tầng *
              </Text>
              {isLoadingFloors ? (
                <ActivityIndicator size="small" />
              ) : floors.length === 0 ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  Không có tầng nào
                </Text>
              ) : (
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
              )}
            </View>

            {/* Available Slots */}
            {selectedFloorId && (
              <View style={styles.slotContainer}>
                <Text variant="bodyMedium" style={styles.label}>
                  Slot khả dụng *
                </Text>
                {isLoadingSlots ? (
                  <ActivityIndicator size="small" style={styles.slotLoading} />
                ) : availableSlots.length === 0 ? (
                  <Text variant="bodySmall" style={styles.errorText}>
                    Không có vị trí khả dụng trong khoảng thời gian này
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
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || !selectedSlotId}
          style={styles.submitButton}
          buttonColor="#4caf50"
        >
          Tạo Booking
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  vehicleTypeContainer: {
    marginBottom: 12,
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
  floorContainer: {
    marginBottom: 16,
  },
  slotContainer: {
    marginTop: 16,
  },
  slotLoading: {
    marginVertical: 16,
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
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});
