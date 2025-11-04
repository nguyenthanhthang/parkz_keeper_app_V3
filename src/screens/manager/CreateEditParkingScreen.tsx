import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Switch,
  List,
  Checkbox,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createParking,
  updateParking,
  getParkingById,
  updateParkingLocation,
  clearError,
} from '../../store/slices/parkingSlice';
import { CreateParkingRequest, UpdateParkingRequest, Parking } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function CreateEditParkingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'CreateEditParking'>>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { currentParking, isLoading, error } = useSelector(
    (state: RootState) => state.parking
  );

  const parkingId = route.params?.parkingId;
  const isEditMode = !!parkingId;

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [motoSpot, setMotoSpot] = useState('0'); // Số slot xe máy
  const [carSpot, setCarSpot] = useState('0'); // Số slot xe ô tô
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Handle location from MapPicker (when returning from MapPicker screen)
  useEffect(() => {
    if (route.params?.selectedLatitude !== undefined && route.params?.selectedLongitude !== undefined) {
      setLatitude(route.params.selectedLatitude.toString());
      setLongitude(route.params.selectedLongitude.toString());
    }
  }, [route.params?.selectedLatitude, route.params?.selectedLongitude]);
  const [isPrepayment, setIsPrepayment] = useState(false); // Có thanh toán trả trước
  const [isOvernight, setIsOvernight] = useState(false); // Có áp dụng qua đêm

  // Load parking data nếu đang edit
  useEffect(() => {
    if (isEditMode && parkingId) {
      dispatch(getParkingById(parkingId));
    }
  }, [isEditMode, parkingId, dispatch]);

  // Populate form khi có currentParking (edit mode)
  useEffect(() => {
    if (currentParking && isEditMode) {
      setName(currentParking.name || '');
      setAddress(currentParking.address || '');
      setDescription(currentParking.description || '');
      // Note: Parking response có thể không có motoSpot/carSpot, cần tính từ totalSlots hoặc để mặc định
      setMotoSpot('0'); // TODO: Lấy từ API response khi có
      setCarSpot('0'); // TODO: Lấy từ API response khi có
      setLatitude(currentParking.latitude?.toString() || '');
      setLongitude(currentParking.longitude?.toString() || '');
      setIsPrepayment(currentParking.isPrepayment ?? false);
      setIsOvernight(currentParking.isOvernight ?? false);
    }
  }, [currentParking, isEditMode]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên bãi đỗ');
      return false;
    }
    if (name.trim().length > 50) {
      toast.showError('Tên bãi đỗ không được quá 50 ký tự');
      return false;
    }
    if (!address.trim()) {
      toast.showError('Vui lòng nhập địa chỉ');
      return false;
    }
    if (address.trim().length > 250) {
      toast.showError('Địa chỉ không được quá 250 ký tự');
      return false;
    }
    if (!description.trim()) {
      toast.showError('Vui lòng nhập mô tả');
      return false;
    }
    if (description.trim().length > 250) {
      toast.showError('Mô tả không được quá 250 ký tự');
      return false;
    }
    const moto = parseInt(motoSpot, 10);
    const car = parseInt(carSpot, 10);
    if (isNaN(moto) || moto < 0) {
      toast.showError('Số slot xe máy phải là số >= 0');
      return false;
    }
    if (isNaN(car) || car < 0) {
      toast.showError('Số slot xe ô tô phải là số >= 0');
      return false;
    }
    if (latitude && isNaN(parseFloat(latitude))) {
      toast.showError('Vĩ độ phải là số hợp lệ');
      return false;
    }
    if (longitude && isNaN(parseFloat(longitude))) {
      toast.showError('Kinh độ phải là số hợp lệ');
      return false;
    }
    return true;
  }, [name, address, description, motoSpot, carSpot, latitude, longitude, toast]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && parkingId) {
        const updateData: UpdateParkingRequest = {
          Name: name.trim(),
          Address: address.trim(),
          Description: description.trim() || undefined,
          Latitude: latitude ? parseFloat(latitude) : undefined,
          Longitude: longitude ? parseFloat(longitude) : undefined,
          IsPrepayment: isPrepayment,
          IsOvernight: isOvernight,
        };

        await dispatch(updateParking({ parkingId, data: updateData })).unwrap();
        toast.showSuccess('Cập nhật bãi đỗ thành công');
      } else {
        const createData: CreateParkingRequest = {
          name: name.trim(), // camelCase theo API spec
          address: address.trim(),
          description: description.trim(), // Required
          motoSpot: parseInt(motoSpot, 10) || 0, // Required, >= 0
          carSpot: parseInt(carSpot, 10) || 0, // Required, >= 0
          isPrepayment: isPrepayment, // Required
          isOvernight: isOvernight, // Required
          managerId: user?.id || 0, // Required
        };

        const result = await dispatch(createParking(createData)).unwrap();
        
        // Response từ parkingApi trả về Parking object với id
        const newParkingId = result?.id;
        
        // Nếu có latitude/longitude, update location sau khi tạo
        if (latitude && longitude && newParkingId) {
          try {
            await dispatch(updateParkingLocation({
              parkingId: newParkingId,
              data: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              },
            })).unwrap();
            toast.showSuccess('Tạo bãi đỗ thành công');
          } catch (err) {
            // Nếu update location fail, không fail toàn bộ, chỉ warn
            console.warn('Tạo bãi đỗ thành công nhưng không thể cập nhật vị trí:', err);
            toast.showWarning('Tạo bãi đỗ thành công. Lưu ý: Vị trí trên bản đồ chưa được cập nhật.');
          }
        } else {
          toast.showSuccess('Tạo bãi đỗ thành công');
        }
      }

      navigation.goBack();
    } catch (err: any) {
      toast.showError(err.message || 'Lưu bãi đỗ thất bại');
    }
  }, [
    validateForm,
    isEditMode,
    parkingId,
    name,
    address,
    description,
    motoSpot,
    carSpot,
    latitude,
    longitude,
    isPrepayment,
    isOvernight,
    user?.id,
    dispatch,
    navigation,
    toast,
  ]);

  if (isEditMode && isLoading && !currentParking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {isEditMode ? 'Chỉnh sửa bãi đỗ' : 'Tạo bãi đỗ mới'}
            </Text>

            {/* Tên bãi xe */}
            <TextInput
              label="Tên *"
              placeholder="Nhập tên bãi xe"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
              editable={!isLoading}
            />

            {/* Payment & Overnight Options - Switch */}
            <Card style={styles.optionsCard}>
              <Card.Content>
                <List.Item
                  title="Gửi xe qua đêm"
                  right={() => (
                    <Switch
                      value={isOvernight}
                      onValueChange={setIsOvernight}
                      disabled={isLoading}
                    />
                  )}
                  titleStyle={styles.switchTitle}
                />
                <List.Item
                  title="Có trả trước phí"
                  right={() => (
                    <Switch
                      value={isPrepayment}
                      onValueChange={setIsPrepayment}
                      disabled={isLoading}
                    />
                  )}
                  titleStyle={styles.switchTitle}
                />
              </Card.Content>
            </Card>

            {/* Mô tả */}
            <TextInput
              label="Mô tả *"
              placeholder="Nhập mô tả"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />

            {/* Địa chỉ */}
            <TextInput
              label="Địa chỉ (Số, đường, quận, TP Hồ Chí Minh) *"
              placeholder="Nhập địa chỉ"
              mode="outlined"
              value={address}
              onChangeText={setAddress}
              style={styles.input}
              multiline
              numberOfLines={2}
              editable={!isLoading}
            />

            {/* Tầng 1 - Floor Configuration */}
            <Card style={styles.floorCard}>
              <Card.Content style={styles.floorCardContent}>
                <Text variant="titleMedium" style={styles.floorTitle}>
                  Tầng 1
                </Text>
                <View style={styles.floorGrid}>
                  <View style={styles.floorInputWrapper}>
                    <TextInput
                      label="Tổng số vị trí"
                      placeholder="0"
                      mode="outlined"
                      value={motoSpot}
                      onChangeText={setMotoSpot}
                      keyboardType="numeric"
                      style={styles.floorInput}
                      editable={!isLoading}
                      dense
                    />
                  </View>
                  <View style={styles.floorInputWrapper}>
                    <TextInput
                      label="Vị trí dự phòng"
                      placeholder="0"
                      mode="outlined"
                      value={carSpot}
                      onChangeText={setCarSpot}
                      keyboardType="numeric"
                      style={styles.floorInput}
                      editable={!isLoading}
                      dense
                    />
                  </View>
                  <View style={styles.floorInputWrapper}>
                    <TextInput
                      label="Số hàng"
                      placeholder="0"
                      mode="outlined"
                      value="0"
                      keyboardType="numeric"
                      style={styles.floorInput}
                      editable={false}
                      dense
                    />
                  </View>
                  <View style={styles.floorInputWrapper}>
                    <TextInput
                      label="Số cột"
                      placeholder="0"
                      mode="outlined"
                      value="0"
                      keyboardType="numeric"
                      style={styles.floorInput}
                      editable={false}
                      dense
                    />
                  </View>
                </View>
                <Button
                  mode="text"
                  icon="plus"
                  onPress={() => {
                    // TODO: Thêm tầng mới
                    toast.showInfo('Chức năng thêm tầng sẽ được phát triển sau');
                  }}
                  disabled={isLoading}
                  style={styles.addFloorButton}
                >
                  Thêm tầng
                </Button>
              </Card.Content>
            </Card>

            {/* Chọn hình ảnh */}
            <View style={styles.imageSection}>
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                Chọn hình ảnh
              </Text>
              <Button
                mode="outlined"
                icon="image"
                onPress={() => {
                  // TODO: Implement image picker
                  toast.showInfo('Chức năng upload hình ảnh sẽ được phát triển sau');
                }}
                disabled={isLoading}
                style={styles.imageButton}
              >
                Tải ảnh lên
              </Button>
            </View>

            {/* Location Selection */}
            <View style={styles.locationSection}>
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                Vị trí bãi đỗ
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  // Navigate to MapPicker
                  navigation.navigate('MapPicker' as never, {
                    initialLatitude: latitude ? parseFloat(latitude) : undefined,
                    initialLongitude: longitude ? parseFloat(longitude) : undefined,
                  } as never);
                }}
                icon="map-marker"
                style={styles.mapButton}
                disabled={isLoading}
              >
                Chọn vị trí trên bản đồ
              </Button>
              <View style={styles.locationRow}>
                <TextInput
                  label="Vĩ độ"
                  placeholder="Vĩ độ"
                  mode="outlined"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.locationInput]}
                  editable={!isLoading}
                  left={<TextInput.Icon icon="latitude" />}
                />

                <TextInput
                  label="Kinh độ"
                  placeholder="Kinh độ"
                  mode="outlined"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.locationInput]}
                  editable={!isLoading}
                  left={<TextInput.Icon icon="longitude" />}
                />
              </View>
            </View>


            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              buttonColor="#6200ee"
            >
              {isEditMode ? 'Cập nhật bãi đỗ' : 'Tạo bãi đỗ'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
              style={styles.cancelButton}
            >
              Hủy
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  card: {
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#424242',
  },
  mapButton: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
  },
  optionsCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  floorCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6200ee',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  floorCardContent: {
    padding: 16,
  },
  floorTitle: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  floorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  floorInputWrapper: {
    width: '48%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  floorInput: {
    marginBottom: 0,
    marginHorizontal: 0,
  },
  addFloorButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageButton: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  cancelButton: {
    paddingVertical: 4,
  },
});
