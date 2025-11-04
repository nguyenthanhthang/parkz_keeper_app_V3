import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Chip,
  Surface,
  TextInput,
  Searchbar,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { floorApi } from '../../services/api/endpoints/floorApi';
import { slotApi } from '../../services/api/endpoints/slotApi';
import { keeperSlotApi } from '../../services/api/endpoints/keeperSlotApi';
import { Floor } from '../../types';
import { ParkingSlot } from '../../types';

export default function SlotListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();

  const parkingId = (user as any)?.parkingId || 0;

  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [selectedSlotForDisable, setSelectedSlotForDisable] = useState<ParkingSlot | null>(null);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [selectedSlotForEnable, setSelectedSlotForEnable] = useState<ParkingSlot | null>(null);

  useEffect(() => {
    if (parkingId > 0) {
      loadFloors();
    }
  }, [parkingId]);

  useEffect(() => {
    if (selectedFloorId) {
      loadSlots();
    }
  }, [selectedFloorId]);

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

  const loadSlots = async () => {
    if (!selectedFloorId) return;

    setIsLoadingSlots(true);
    try {
      const slotsData = await slotApi.getSlotsByFloor(selectedFloorId);
      setSlots(slotsData);
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách slot');
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFloors(), loadSlots()]);
    setRefreshing(false);
  }, [parkingId, selectedFloorId]);

  const handleDisableSlot = (slot: ParkingSlot) => {
    setSelectedSlotForDisable(slot);
    setDisableReason('');
    setShowDisableDialog(true);
  };

  const handleConfirmDisable = async () => {
    if (!selectedSlotForDisable) return;

    if (!disableReason.trim()) {
      toast.showError('Vui lòng nhập lý do');
      return;
    }

    try {
      await keeperSlotApi.disableSlot({
        parkingSlotId: selectedSlotForDisable.id,
        reason: disableReason.trim(),
      });
      toast.showSuccess('Đã vô hiệu hóa slot');
      setShowDisableDialog(false);
      setDisableReason('');
      setSelectedSlotForDisable(null);
      loadSlots();
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể vô hiệu hóa slot');
    }
  };

  const handleEnableSlot = (slot: ParkingSlot) => {
    setSelectedSlotForEnable(slot);
    setShowEnableDialog(true);
  };

  const handleConfirmEnableSlot = async () => {
    if (!selectedSlotForEnable) return;

    try {
      await keeperSlotApi.enableSlot({
        parkingSlotId: selectedSlotForEnable.id,
      });
      toast.showSuccess('Đã kích hoạt slot');
      setShowEnableDialog(false);
      setSelectedSlotForEnable(null);
      loadSlots();
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể kích hoạt slot');
    }
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return '#4caf50';
      case 'Occupied':
        return '#f44336';
      case 'Disabled':
        return '#757575';
      case 'Reserved':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getSlotStatusLabel = (status: string) => {
    switch (status) {
      case 'Available':
        return 'Khả dụng';
      case 'Occupied':
        return 'Đang dùng';
      case 'Disabled':
        return 'Vô hiệu hóa';
      case 'Reserved':
        return 'Đã đặt';
      default:
        return status;
    }
  };

  const filteredSlots = slots.filter((slot) =>
    slot.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (parkingId === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floor Selection */}
      <Card style={styles.floorCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Chọn tầng
          </Text>
          {isLoadingFloors ? (
            <ActivityIndicator size="small" />
          ) : floors.length === 0 ? (
            <Text variant="bodySmall" style={styles.errorText}>
              Không có tầng nào
            </Text>
          ) : (
            <FlatList
              horizontal
              data={floors}
              keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `floor-${index}`)}
              renderItem={({ item }) => (
                <Chip
                  selected={selectedFloorId === item.id}
                  onPress={() => setSelectedFloorId(item.id)}
                  style={[
                    styles.floorChip,
                    selectedFloorId === item.id && styles.floorChipSelected,
                  ]}
                  selectedColor="#fff"
                  textStyle={
                    selectedFloorId === item.id
                      ? styles.floorChipTextSelected
                      : styles.floorChipText
                  }
                >
                  {item.name}
                </Chip>
              )}
              contentContainerStyle={styles.floorList}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </Card.Content>
      </Card>

      {/* Search */}
      <Searchbar
        placeholder="Tìm kiếm vị trí..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Danh sách vị trí */}
      {isLoadingSlots ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : filteredSlots.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {searchQuery
              ? 'Không tìm thấy vị trí nào'
              : selectedFloorId
              ? 'Tầng này chưa có vị trí nào'
              : 'Vui lòng chọn tầng'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSlots}
          keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `slot-${index}`)}
          renderItem={({ item: slot }) => (
            <Card style={styles.slotCard}>
              <Card.Content>
                <View style={styles.slotHeader}>
                  <View style={styles.slotInfo}>
                    <Text variant="titleMedium" style={styles.slotName}>
                      {slot.name}
                    </Text>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getSlotStatusColor(slot.status || 'Available') },
                      ]}
                      textStyle={{ color: '#fff', fontSize: 12 }}
                    >
                      {getSlotStatusLabel(slot.status || 'Available')}
                    </Chip>
                  </View>
                  {slot.slotType && (
                    <Text variant="bodySmall" style={styles.slotType}>
                      {slot.slotType}
                    </Text>
                  )}
                </View>

                {slot.disabledReason && (
                  <View style={styles.disabledReasonContainer}>
                    <Text variant="bodySmall" style={styles.disabledReason}>
                      Lý do: {slot.disabledReason}
                    </Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  {slot.status === 'Disabled' ? (
                    <Button
                      mode="contained"
                      onPress={() => handleEnableSlot(slot)}
                      buttonColor="#4caf50"
                      style={styles.actionButton}
                      compact
                    >
                      Kích hoạt
                    </Button>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={() => handleDisableSlot(slot)}
                      buttonColor="#ff9800"
                      style={styles.actionButton}
                      compact
                    >
                      Vô hiệu hóa
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Disable Slot Dialog */}
      <Portal>
        <Dialog
          visible={showDisableDialog}
          onDismiss={() => {
            setShowDisableDialog(false);
            setDisableReason('');
            setSelectedSlotForDisable(null);
          }}
        >
          <Dialog.Title>Vô hiệu hóa vị trí</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Vị trí: <Text style={styles.boldText}>{selectedSlotForDisable?.name}</Text>
            </Paragraph>
            <TextInput
              label="Lý do vô hiệu hóa *"
              value={disableReason}
              onChangeText={setDisableReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowDisableDialog(false);
                setDisableReason('');
                setSelectedSlotForDisable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onPress={handleConfirmDisable}
              mode="contained"
              disabled={!disableReason.trim()}
            >
              Xác nhận
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Enable Slot Dialog */}
        <Dialog
          visible={showEnableDialog}
          onDismiss={() => {
            setShowEnableDialog(false);
            setSelectedSlotForEnable(null);
          }}
        >
          <Dialog.Title>Kích hoạt vị trí</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Vị trí: <Text style={styles.boldText}>{selectedSlotForEnable?.name}</Text>
            </Paragraph>
            <Paragraph>
              Bạn có chắc chắn muốn kích hoạt vị trí này không?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowEnableDialog(false);
                setSelectedSlotForEnable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onPress={handleConfirmEnableSlot}
              mode="contained"
              buttonColor="#4caf50"
            >
              Xác nhận
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  floorCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  floorList: {
    gap: 8,
  },
  floorChip: {
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  floorChipSelected: {
    backgroundColor: '#6200ee',
  },
  floorChipText: {
    color: '#212121',
  },
  floorChipTextSelected: {
    color: '#fff',
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  slotCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotName: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  slotType: {
    color: '#757575',
  },
  disabledReasonContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  disabledReason: {
    color: '#c62828',
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 120,
  },
  errorText: {
    color: '#f44336',
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  dialogInput: {
    marginTop: 16,
  },
});