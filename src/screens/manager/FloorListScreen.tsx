import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getFloorsByParking,
  deleteFloor,
  clearError,
} from '../../store/slices/floorSlice';
import { Floor } from '../../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParkingStackParamList } from '../../navigation/types';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';

export default function FloorListScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'FloorList'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { floors, isLoading, error } = useSelector(
    (state: RootState) => state.floor
  );

  const parkingId = route.params?.parkingId || 0;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (parkingId > 0) {
      loadFloors();
    }
  }, [parkingId]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadFloors = useCallback(() => {
    if (parkingId > 0) {
      dispatch(getFloorsByParking(parkingId));
    }
  }, [dispatch, parkingId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFloors().finally(() => {
      setRefreshing(false);
    });
  }, [loadFloors]);

  const handleFloorPress = (floor: Floor) => {
    navigation.navigate('FloorDetail' as never, { floorId: floor.id } as never);
  };

  const handleCreateFloor = () => {
    navigation.navigate('CreateEditFloor' as never, { parkingId } as never);
  };

  const handleEditFloor = (floor: Floor) => {
    navigation.navigate('CreateEditFloor' as never, { 
      parkingId, 
      floorId: floor.id 
    } as never);
  };

  const handleDeleteFloor = (floor: Floor) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa tầng "${floor.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteFloor(floor.id)).unwrap();
              Alert.alert('Thành công', 'Đã xóa tầng thành công');
              loadFloors();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa tầng');
            }
          },
        },
      ]
    );
  };

  const renderFloorCard = ({ item }: { item: Floor }) => (
    <TouchableOpacity onPress={() => handleFloorPress(item)}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.floorName}>
              {item.name}
            </Text>
            <Chip icon="layers" style={styles.chip}>
              Tầng
            </Chip>
          </View>
          {item.description && (
            <Text variant="bodySmall" style={styles.description}>
              {item.description}
            </Text>
          )}
          <View style={styles.statsContainer}>
            {item.totalSlots !== undefined && (
              <Text variant="bodySmall" style={styles.stats}>
                Tổng vị trí: {item.totalSlots}
              </Text>
            )}
            {item.availableSlots !== undefined && (
              <Text variant="bodySmall" style={styles.stats}>
                Còn trống: {item.availableSlots}
              </Text>
            )}
          </View>
        </Card.Content>
        <Card.Actions>
          <Chip
            onPress={() => handleEditFloor(item)}
            style={styles.editButton}
            icon="pencil"
          >
            Sửa
          </Chip>
          <Chip
            onPress={() => handleDeleteFloor(item)}
            style={styles.deleteButton}
            icon="delete"
            textStyle={styles.deleteButtonText}
          >
            Xóa
          </Chip>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && floors.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách tầng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={floors}
        renderItem={renderFloorCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có tầng nào. Hãy tạo tầng đầu tiên!
              </Text>
            </Card.Content>
          </Card>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateFloor}
        label="Tầng mới"
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
  floorName: {
    flex: 1,
    fontWeight: 'bold',
  },
  chip: {
    height: 28,
  },
  description: {
    color: '#757575',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stats: {
    color: '#757575',
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#ffffff',
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

