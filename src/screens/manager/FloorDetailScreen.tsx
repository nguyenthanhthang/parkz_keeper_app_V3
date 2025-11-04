import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getFloorsByParking,
  setCurrentFloor,
  clearError,
} from '../../store/slices/floorSlice';
import {
  getSlotsByFloor,
  updateSlot,
  setCurrentFloorId,
  clearError as clearSlotError,
} from '../../store/slices/slotSlice';
import { Floor, ParkingSlot, SlotStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const SLOT_SIZE = (width - 64) / 4; // 4 columns với padding

export default function FloorDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'FloorDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { floors, isLoading: floorLoading } = useSelector(
    (state: RootState) => state.floor
  );
  const { currentSlots, isLoading: slotLoading, error } = useSelector(
    (state: RootState) => state.slot
  );

  const floorId = route.params?.floorId || 0;
  const [refreshing, setRefreshing] = useState(false);
  const [currentFloor, setCurrentFloorLocal] = useState<Floor | null>(null);

  useEffect(() => {
    if (floorId > 0) {
      loadData();
    }
    return () => {
      dispatch(setCurrentFloor(null));
      dispatch(setCurrentFloorId(null));
    };
  }, [floorId]);

  useEffect(() => {
    // Tìm floor từ list
    const floor = floors.find((f) => f.id === floorId);
    if (floor) {
      setCurrentFloorLocal(floor);
      dispatch(setCurrentFloor(floor));
    }
  }, [floors, floorId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearSlotError());
    }
  }, [error, dispatch, toast]);

  const loadData = async () => {
    if (floorId > 0) {
      dispatch(setCurrentFloorId(floorId));
      await dispatch(getSlotsByFloor(floorId));
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [floorId]);

  const handleEditFloor = () => {
    if (currentFloor) {
      navigation.navigate('CreateEditFloor' as never, {
        parkingId: currentFloor.parkingId,
        floorId: currentFloor.id,
      } as never);
    }
  };

  const handleCreateSlot = () => {
    navigation.navigate('CreateEditSlot' as never, { floorId } as never);
  };

  const handleEditSlot = (slot: ParkingSlot) => {
    navigation.navigate('CreateEditSlot' as never, {
      floorId,
      slotId: slot.id,
    } as never);
  };

  const getSlotStatusColor = (status: SlotStatus): string => {
    switch (status) {
      case SlotStatus.AVAILABLE:
        return '#4caf50'; // Green
      case SlotStatus.OCCUPIED:
        return '#f44336'; // Red
      case SlotStatus.DISABLED:
        return '#757575'; // Grey
      case SlotStatus.RESERVED:
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e';
    }
  };

  const getSlotStatusLabel = (status: SlotStatus): string => {
    switch (status) {
      case SlotStatus.AVAILABLE:
        return 'Trống';
      case SlotStatus.OCCUPIED:
        return 'Đã đỗ';
      case SlotStatus.DISABLED:
        return 'Vô hiệu';
      case SlotStatus.RESERVED:
        return 'Đặt trước';
      default:
        return status;
    }
  };

  const renderSlot = ({ item }: { item: ParkingSlot }) => (
    <TouchableOpacity
      style={[
        styles.slotItem,
        { backgroundColor: getSlotStatusColor(item.status) },
      ]}
      onPress={() => handleEditSlot(item)}
    >
      <Text style={styles.slotName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.slotStatus} numberOfLines={1}>
        {getSlotStatusLabel(item.status)}
      </Text>
    </TouchableOpacity>
  );

  if (floorLoading || slotLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thông tin tầng...</Text>
      </View>
    );
  }

  if (!currentFloor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy tầng</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.floorName}>
                {currentFloor.name}
              </Text>
              <IconButton
                icon="pencil"
                size={24}
                onPress={handleEditFloor}
              />
            </View>
            <Divider style={styles.divider} />
            {currentFloor.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {currentFloor.description}
              </Text>
            )}
            <View style={styles.statsRow}>
              <Chip icon="slot" style={styles.statChip}>
                Tổng vị trí: {currentSlots.length}
              </Chip>
              <Chip
                icon="check-circle"
                style={[styles.statChip, { backgroundColor: '#4caf50' }]}
              >
                Trống:{' '}
                {
                  currentSlots.filter(
                    (s) => s.status === SlotStatus.AVAILABLE
                  ).length
                }
              </Chip>
              <Chip
                icon="close-circle"
                style={[styles.statChip, { backgroundColor: '#f44336' }]}
              >
                Đã đỗ:{' '}
                {
                  currentSlots.filter(
                    (s) => s.status === SlotStatus.OCCUPIED
                  ).length
                }
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.slotsCard}>
          <Card.Content>
            <View style={styles.slotsHeader}>
              <Text variant="titleMedium" style={styles.slotsTitle}>
                Danh sách vị trí
              </Text>
              <Button
                mode="outlined"
                compact
                onPress={handleRefresh}
                icon="refresh"
              >
                Làm mới
              </Button>
            </View>
            <Divider style={styles.divider} />
          </Card.Content>
        </Card>

        {currentSlots.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có vị trí nào. Hãy tạo vị trí đầu tiên!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.slotsGrid}>
            {currentSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotItem,
                  { backgroundColor: getSlotStatusColor(slot.status) },
                ]}
                onPress={() => handleEditSlot(slot)}
              >
                <Text style={styles.slotName} numberOfLines={1}>
                  {slot.name}
                </Text>
                <Text style={styles.slotStatus} numberOfLines={1}>
                  {getSlotStatusLabel(slot.status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateSlot}
        label="Slot mới"
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
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floorName: {
    flex: 1,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  description: {
    color: '#757575',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    backgroundColor: '#e0e0e0',
  },
  slotsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  slotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotsTitle: {
    fontWeight: 'bold',
  },
  emptyCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  slotItem: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  slotName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  slotStatus: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

