import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
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
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getParkingById,
  deleteParking,
  markParkingFull,
  setCurrentParking,
  clearError,
} from '../../store/slices/parkingSlice';
import { Parking } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function ParkingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'ParkingDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { currentParking, isLoading, error } = useSelector(
    (state: RootState) => state.parking
  );

  const parkingId = route.params?.parkingId || 0;

  useEffect(() => {
    if (parkingId > 0) {
      dispatch(getParkingById(parkingId));
    }
    return () => {
      dispatch(setCurrentParking(null));
    };
  }, [parkingId, dispatch]);

      useEffect(() => {
        if (error) {
          Alert.alert('Lỗi', error);
          dispatch(clearError());
        }
      }, [error, dispatch]);

  const handleEdit = () => {
    if (currentParking) {
      navigation.navigate('CreateEditParking' as never, { parkingId: currentParking.id } as never);
    }
  };

  const handleDelete = () => {
    if (!currentParking) return;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${currentParking.isActive ? 'vô hiệu hóa' : 'kích hoạt'} bãi đỗ này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteParking(parkingId)).unwrap();
              Alert.alert('Thành công', 'Cập nhật bãi đỗ thành công');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Cập nhật bãi đỗ thất bại');
            }
          },
        },
      ]
    );
  };

  const handleMarkFull = () => {
    if (!currentParking) return;

    Alert.alert(
      'Đánh dấu bãi đỗ',
      `Bạn có chắc muốn đánh dấu bãi đỗ này là ${currentParking.isFull ? 'còn trống' : 'đã đầy'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await dispatch(markParkingFull(parkingId)).unwrap();
              Alert.alert('Thành công', 'Cập nhật trạng thái bãi đỗ thành công');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Cập nhật trạng thái thất bại');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !currentParking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thông tin bãi đỗ...</Text>
      </View>
    );
  }

  if (!currentParking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy bãi đỗ</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Chi tiết bãi đỗ
        </Text>
        <View style={styles.headerActions}>
          <IconButton icon="pencil" size={24} onPress={handleEdit} />
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="headlineMedium" style={styles.parkingName}>
              {currentParking.name}
            </Text>
            <View style={styles.statusContainer}>
              <Chip
                icon={currentParking.isActive ? 'check-circle' : 'close-circle'}
                style={[
                  styles.statusChip,
                  currentParking.isActive ? styles.activeChip : styles.inactiveChip,
                ]}
              >
                {currentParking.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </Chip>
              {currentParking.isFull && (
                <Chip icon="alert" style={styles.fullChip}>
                  Đã đầy
                </Chip>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <InfoRow label="Địa chỉ" value={currentParking.address} />
            {currentParking.description && (
              <InfoRow label="Mô tả" value={currentParking.description} />
            )}
            {(currentParking.latitude !== undefined || currentParking.longitude !== undefined) && (
              <InfoRow
                label="Vị trí"
                value={`${currentParking.latitude?.toFixed(6)}, ${currentParking.longitude?.toFixed(6)}`}
              />
            )}
            {currentParking.totalSlots !== undefined && (
              <InfoRow label="Tổng chỗ" value={currentParking.totalSlots.toString()} />
            )}
            {currentParking.availableSlots !== undefined && (
              <InfoRow
                label="Chỗ còn trống"
                value={currentParking.availableSlots.toString()}
              />
            )}
            {currentParking.managerId && (
              <InfoRow label="ID Quản lý" value={currentParking.managerId.toString()} />
            )}
            {currentParking.createdAt && (
              <InfoRow
                label="Ngày tạo"
                value={new Date(currentParking.createdAt).toLocaleDateString('vi-VN')}
              />
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleMarkFull}
          style={styles.actionButton}
          icon={currentParking.isFull ? 'car-off' : 'car-multiple'}
        >
          {currentParking.isFull ? 'Đánh dấu còn trống' : 'Đánh dấu đã đầy'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.actionButton}
          icon={currentParking.isActive ? 'close-circle' : 'check-circle'}
          textColor={currentParking.isActive ? '#f44336' : '#4caf50'}
        >
          {currentParking.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
        </Button>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    marginBottom: 16,
  },
  parkingName: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    height: 32,
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#f44336',
  },
  fullChip: {
    backgroundColor: '#ff9800',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
});
