import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Searchbar, Card, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getAllParkings,
  setSearchQuery,
  clearError,
} from '../../store/slices/parkingSlice';
import { Parking } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

export default function ParkingListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { parkings, isLoading, error, searchQuery } = useSelector(
    (state: RootState) => state.parking
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadParkings();
  }, [user?.id]);

  const loadParkings = useCallback(() => {
    // Gọi API với managerId nếu có
    dispatch(getAllParkings({ managerId: user?.id }));
  }, [dispatch, user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(getAllParkings({ managerId: user?.id })).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch, user?.id]);

  const handleSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const filteredParkings = parkings.filter((parking) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      parking.name.toLowerCase().includes(query) ||
      parking.address.toLowerCase().includes(query)
    );
  });

  const handleParkingPress = (parking: Parking) => {
    if (!parking?.id) {
      console.warn('Parking ID is missing:', parking);
      return;
    }
    navigation.navigate('ParkingDetail' as never, { parkingId: parking.id } as never);
  };

  const handleCreateParking = () => {
    navigation.navigate('CreateEditParking' as never, {} as never);
  };

  const renderParkingCard = ({ item }: { item: Parking }) => (
    <TouchableOpacity onPress={() => handleParkingPress(item)}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.parkingName}>
              {item.name}
            </Text>
            <Chip
              icon={item.isActive ? 'check-circle' : 'close-circle'}
              style={[
                styles.statusChip,
                item.isActive ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              {item.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={styles.address}>
            {item.address}
          </Text>
          {item.description && (
            <Text variant="bodySmall" style={styles.description}>
              {item.description}
            </Text>
          )}
          <View style={styles.statsContainer}>
            {item.totalSlots !== undefined && (
              <Text variant="bodySmall" style={styles.stats}>
                Tổng chỗ: {item.totalSlots}
              </Text>
            )}
            {item.availableSlots !== undefined && (
              <Text variant="bodySmall" style={styles.stats}>
                Còn trống: {item.availableSlots}
              </Text>
            )}
            {item.isFull && (
              <Chip icon="alert" style={styles.fullChip}>
                Đã đầy
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm bãi đỗ..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty state với message rõ ràng hơn */}
      {!isLoading && !error && parkings.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Chưa có bãi đỗ
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {searchQuery 
              ? 'Không tìm thấy bãi đỗ phù hợp'
              : 'Bắt đầu bằng cách tạo bãi đỗ đầu tiên của bạn'}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredParkings}
        renderItem={renderParkingCard}
        keyExtractor={(item, index) => (item?.id != null ? item.id.toString() : `parking-${index}`)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={null} // Đã move empty state ra ngoài
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateParking}
        label="Thêm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  statusChip: {
    height: 28,
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#f44336',
  },
  address: {
    marginBottom: 4,
    color: '#757575',
  },
  description: {
    marginTop: 4,
    color: '#9e9e9e',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  stats: {
    color: '#616161',
    marginRight: 12,
  },
  fullChip: {
    backgroundColor: '#ff9800',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    color: '#424242',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#c62828',
  },
});
