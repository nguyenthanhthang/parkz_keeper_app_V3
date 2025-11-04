import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getParkingPrices,
  disableEnableParkingPrice,
  clearError,
} from '../../store/slices/pricingSlice';
import { ParkingPrice } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';

export default function PricingListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { parkingPrices, isLoading, error } = useSelector(
    (state: RootState) => state.pricing
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadPrices = useCallback(() => {
    dispatch(getParkingPrices());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPrices().finally(() => {
      setRefreshing(false);
    });
  }, [loadPrices]);

  const handleCreatePrice = () => {
    navigation.navigate('CreateEditPricing' as never, {} as never);
  };

  const handleEditPrice = (price: ParkingPrice) => {
    navigation.navigate('CreateEditPricing' as never, { parkingPriceId: price.id } as never);
  };

  const handleViewTimeline = (price: ParkingPrice) => {
    navigation.navigate('TimelineManagement' as never, { parkingPriceId: price.id } as never);
  };

  const handleToggleActive = (price: ParkingPrice) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${price.isActive ? 'vô hiệu hóa' : 'kích hoạt'} bảng giá này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await dispatch(
                disableEnableParkingPrice({
                  parkingPriceId: price.id,
                  isActive: !price.isActive,
                })
              ).unwrap();
              toast.showSuccess('Cập nhật trạng thái bảng giá thành công');
              loadPrices();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
  };

  const renderPriceCard = ({ item }: { item: ParkingPrice }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.priceName}>
            {item.name}
          </Text>
          <Chip
            icon={item.isActive ? 'check-circle' : 'close-circle'}
            style={[
              styles.statusChip,
              item.isActive ? styles.activeChip : styles.inactiveChip,
            ]}
          >
            {item.isActive ? 'Hoạt động' : 'Vô hiệu'}
          </Chip>
        </View>
        {item.description && (
          <Text variant="bodySmall" style={styles.description}>
            {item.description}
          </Text>
        )}
        {item.createdAt && (
          <Text variant="bodySmall" style={styles.dateText}>
            Tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          compact
          onPress={() => handleViewTimeline(item)}
          icon="clock"
        >
          Timeline
        </Button>
        <Button
          mode="outlined"
          compact
          onPress={() => handleEditPrice(item)}
          icon="pencil"
        >
          Sửa
        </Button>
        <Button
          mode="outlined"
          compact
          onPress={() => handleToggleActive(item)}
          icon={item.isActive ? 'close-circle' : 'check-circle'}
          textColor={item.isActive ? '#f44336' : '#4caf50'}
        >
          {item.isActive ? 'Vô hiệu' : 'Kích hoạt'}
        </Button>
      </Card.Actions>
    </Card>
  );

  if (isLoading && parkingPrices.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách bảng giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={parkingPrices}
        renderItem={renderPriceCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có bảng giá nào. Hãy tạo bảng giá đầu tiên!
              </Text>
            </Card.Content>
          </Card>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreatePrice}
        label="Bảng giá mới"
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
  priceName: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#757575',
  },
  description: {
    color: '#757575',
    marginTop: 8,
    marginBottom: 8,
  },
  dateText: {
    color: '#757575',
  },
  emptyCard: {
    marginTop: 32,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

