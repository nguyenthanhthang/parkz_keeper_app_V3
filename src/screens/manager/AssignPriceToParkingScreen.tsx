import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getParkingHasPriceList,
  createParkingHasPrice,
  deleteParkingHasPrice,
  getParkingPrices,
  clearError,
} from '../../store/slices/pricingSlice';
import { getAllParkings as getParkings } from '../../store/slices/parkingSlice';
import { ParkingHasPrice, ParkingPrice, Parking } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';

export default function AssignPriceToParkingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { parkingHasPrices, parkingPrices, isLoading, error } = useSelector(
    (state: RootState) => state.pricing
  );
  const { parkings } = useSelector((state: RootState) => state.parking);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadData = useCallback(async () => {
    if (user?.id) {
      await Promise.all([
        dispatch(getParkingHasPriceList(user.id)),
        dispatch(getParkingPrices()),
        dispatch(getParkings({ managerId: user.id })),
      ]);
    }
  }, [dispatch, user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => {
      setRefreshing(false);
    });
  }, [loadData]);

  const handleAssignPrice = (parking: Parking) => {
    if (parkingPrices.length === 0) {
      toast.showWarning('Chưa có bảng giá nào. Vui lòng tạo bảng giá trước.');
      return;
    }

    // Find if parking already has a price
    const existingAssignment = parkingHasPrices.find(
      (php) => php.parkingId === parking.id
    );

    if (existingAssignment) {
      const price = parkingPrices.find((p) => p.id === existingAssignment.parkingPriceId);
      Alert.alert(
        'Thông báo',
        `Bãi đỗ này đã được gán bảng giá "${price?.name || 'N/A'}".\nBạn có muốn xóa và gán lại không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => handleRemovePrice(parking.id, existingAssignment.parkingPriceId),
          },
        ]
      );
      return;
    }

    // Show price selection
    const priceOptions = parkingPrices.map((p) => p.name);
    Alert.alert(
      'Chọn bảng giá',
      'Chọn bảng giá để gán cho bãi đỗ này:',
      [
        ...parkingPrices.map((price) => ({
          text: price.name,
          onPress: () => handleAssign(parking.id, price.id),
        })),
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleAssign = async (parkingId: number, parkingPriceId: number) => {
    try {
      await dispatch(
        createParkingHasPrice({
          parkingId,
          parkingPriceId,
        })
      ).unwrap();
      toast.showSuccess('Đã gán bảng giá cho bãi đỗ thành công');
      loadData();
    } catch (err: any) {
      toast.showError(err.message || 'Không thể gán bảng giá');
    }
  };

  const handleRemovePrice = async (parkingId: number, parkingPriceId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa gán giá này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                deleteParkingHasPrice({ parkingId, parkingPriceId })
              ).unwrap();
              toast.showSuccess('Đã xóa gán giá thành công');
              loadData();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể xóa gán giá');
            }
          },
        },
      ]
    );
  };

  const getParkingPrice = (parkingId: number): ParkingPrice | undefined => {
    const assignment = parkingHasPrices.find((php) => php.parkingId === parkingId);
    if (assignment) {
      return parkingPrices.find((p) => p.id === assignment.parkingPriceId);
    }
    return undefined;
  };

  const renderParkingCard = ({ item }: { item: Parking }) => {
    const assignedPrice = getParkingPrice(item.id);
    const hasPrice = !!assignedPrice;

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.parkingName}>
              {item.name}
            </Text>
            {hasPrice && (
              <Chip icon="check-circle" style={styles.assignedChip}>
                Đã gán
              </Chip>
            )}
          </View>
          <Text variant="bodySmall" style={styles.address}>
            {item.address}
          </Text>
          {hasPrice && (
            <View style={styles.priceInfo}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                Bảng giá: {assignedPrice.name}
              </Text>
            </View>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            mode={hasPrice ? 'outlined' : 'contained'}
            onPress={() => {
              if (hasPrice && assignedPrice) {
                handleRemovePrice(item.id, assignedPrice.id);
              } else {
                handleAssignPrice(item);
              }
            }}
            icon={hasPrice ? 'delete' : 'plus'}
            textColor={hasPrice ? '#f44336' : undefined}
          >
            {hasPrice ? 'Xóa gán giá' : 'Gán giá'}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (isLoading && parkings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách bãi đỗ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={parkings}
        renderItem={renderParkingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có bãi đỗ nào. Hãy tạo bãi đỗ trước!
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
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parkingName: {
    flex: 1,
    fontWeight: 'bold',
  },
  assignedChip: {
    backgroundColor: '#4caf50',
  },
  address: {
    color: '#757575',
    marginBottom: 8,
  },
  priceInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceLabel: {
    color: '#6200ee',
    fontWeight: '500',
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

