import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Dialog,
  Portal,
  Paragraph,
  Button,
  TextInput,
} from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { floorApi } from "../../services/api/endpoints/floorApi";
import { slotApi } from "../../services/api/endpoints/slotApi";
import { keeperSlotApi } from "../../services/api/endpoints/keeperSlotApi";
import { Floor } from "../../types";
import { ParkingSlot } from "../../types";
import { useNavigation } from "@react-navigation/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_PADDING = 16;
const SLOT_SIZE = (SCREEN_WIDTH - GRID_PADDING * 3) / 4; // 4 columns với padding

interface SlotGridCellProps {
  slot: ParkingSlot;
  onPress: (slot: ParkingSlot) => void;
}

const SlotGridCell: React.FC<SlotGridCellProps> = ({ slot, onPress }) => {
  const getSlotColor = (): string => {
    // Vô hiệu hóa
    if (!slot.isAvailable || slot.isDisabled || slot.status === "Disabled") {
      return "#757575"; // Xám
    }
    // Backup
    if (slot.isBackup) {
      return "#ffc107"; // Vàng
    }
    // Đã đặt
    if (slot.isBooked === 1 || slot.isBooked === true) {
      return "#f44336"; // Đỏ
    }
    // Trống
    return "#4caf50"; // Xanh lá
  };

  const getSlotStatusLabel = (): string => {
    if (!slot.isAvailable || slot.isDisabled || slot.status === "Disabled") {
      return "Vô hiệu";
    }
    if (slot.isBackup) {
      return "Backup";
    }
    if (slot.isBooked === 1 || slot.isBooked === true) {
      return "Đã đặt";
    }
    return "Trống";
  };

  const slotColor = getSlotColor();
  const statusLabel = getSlotStatusLabel();

  return (
    <TouchableOpacity
      style={[styles.slotCell, { backgroundColor: slotColor }]}
      onPress={() => onPress(slot)}
      activeOpacity={0.7}
    >
      <Text variant="labelSmall" style={styles.slotName} numberOfLines={1}>
        {slot.name}
      </Text>
      <Text variant="labelSmall" style={styles.slotStatus}>
        {statusLabel}
      </Text>
      {slot.licensePlate && (
        <Text variant="labelSmall" style={styles.slotPlate} numberOfLines={1}>
          {slot.licensePlate}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function ParkingMapScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();

  const parkingId = (user as any)?.parkingId || 0;

  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [slotsGrid, setSlotsGrid] = useState<(ParkingSlot | null)[][]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [showEnableDialog, setShowEnableDialog] = useState(false);

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
      // Filter out invalid floors
      const validFloors = floorsData.filter((floor) => floor && floor.id);
      setFloors(validFloors);
      if (validFloors.length > 0 && !selectedFloorId) {
        setSelectedFloorId(validFloors[0].id);
      }
    } catch (error: any) {
      toast.showError(error?.message || "Không thể tải danh sách tầng");
      setFloors([]);
    } finally {
      setIsLoadingFloors(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedFloorId) return;

    setIsLoadingSlots(true);
    try {
      const slotsData = await slotApi.getSlotsByFloor(selectedFloorId);
      // Filter out invalid slots
      const validSlots = slotsData.filter((slot) => slot && slot.id);
      setSlots(validSlots);
      buildGrid(validSlots);
    } catch (error: any) {
      toast.showError(error?.message || "Không thể tải danh sách slot");
      setSlots([]);
      setSlotsGrid([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const buildGrid = (slotsData: ParkingSlot[]) => {
    if (!slotsData || slotsData.length === 0) {
      setSlotsGrid([]);
      return;
    }

    // Tìm max row và column
    let maxRow = 0;
    let maxCol = 0;

    slotsData.forEach((slot) => {
      const row = slot.rowIndex || 0;
      const col = slot.columnIndex || 0;
      if (row > maxRow) maxRow = row;
      if (col > maxCol) maxCol = col;
    });

    // Nếu không có rowIndex/columnIndex, sử dụng fallback
    if (maxRow === 0 && maxCol === 0) {
      // Sắp xếp theo name (A1, A2, B1, B2...)
      const sortedSlots = [...slotsData].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      // Chia thành các hàng, mỗi hàng 4 slot
      const rows: (ParkingSlot | null)[][] = [];
      for (let i = 0; i < sortedSlots.length; i += 4) {
        rows.push(sortedSlots.slice(i, i + 4));
      }
      setSlotsGrid(rows);
      return;
    }

    // Tạo grid 2D
    const grid: (ParkingSlot | null)[][] = [];
    for (let row = 1; row <= maxRow; row++) {
      const rowArray: (ParkingSlot | null)[] = [];
      for (let col = 1; col <= maxCol; col++) {
        const slot = slotsData.find(
          (s) => (s.rowIndex || 0) === row && (s.columnIndex || 0) === col
        );
        rowArray.push(slot || null);
      }
      grid.push(rowArray);
    }

    setSlotsGrid(grid);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFloors(), loadSlots()]);
    setRefreshing(false);
  }, [parkingId, selectedFloorId]);

  const handleSlotPress = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setShowSlotDialog(true);
  };

  const handleDisableSlot = () => {
    if (!selectedSlot) return;
    setShowSlotDialog(false);
    setDisableReason("");
    setShowDisableDialog(true);
  };

  const handleEnableSlot = () => {
    if (!selectedSlot) return;
    setShowSlotDialog(false);
    setShowEnableDialog(true);
  };

  const handleConfirmDisable = async () => {
    if (!selectedSlot || !disableReason.trim()) {
      toast.showError("Vui lòng nhập lý do");
      return;
    }

    try {
      await keeperSlotApi.disableSlot({
        parkingSlotId: selectedSlot.id,
        reason: disableReason.trim(),
      });
      toast.showSuccess("Đã vô hiệu hóa slot");
      setShowDisableDialog(false);
      setDisableReason("");
      setSelectedSlot(null);
      loadSlots();
    } catch (error: any) {
      toast.showError(error?.message || "Không thể vô hiệu hóa slot");
    }
  };

  const handleConfirmEnable = async () => {
    if (!selectedSlot) return;

    try {
      await keeperSlotApi.enableSlot({
        parkingSlotId: selectedSlot.id,
      });
      toast.showSuccess("Đã kích hoạt slot");
      setShowEnableDialog(false);
      setSelectedSlot(null);
      loadSlots();
    } catch (error: any) {
      toast.showError(error?.message || "Không thể kích hoạt slot");
    }
  };

  const handleViewBooking = () => {
    if (!selectedSlot?.bookingId) return;
    setShowSlotDialog(false);
    navigation.navigate("BookingTab" as never, {
      screen: "BookingDetail",
      params: { bookingId: selectedSlot.bookingId },
    } as never);
  };

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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.floorList}
            >
              {floors
                .filter((floor) => floor && floor.id)
                .map((floor, index) => (
                  <Chip
                    key={`floor-${floor.id}-${index}`}
                    selected={selectedFloorId === floor.id}
                    onPress={() => setSelectedFloorId(floor.id)}
                    style={[
                      styles.floorChip,
                      selectedFloorId === floor.id && styles.floorChipSelected,
                    ]}
                    selectedColor="#fff"
                    textStyle={
                      selectedFloorId === floor.id
                        ? styles.floorChipTextSelected
                        : styles.floorChipText
                    }
                  >
                    {floor.name || `Tầng ${index + 1}`}
                  </Chip>
                ))}
            </ScrollView>
          )}
        </Card.Content>
      </Card>

      {/* Grid */}
      {isLoadingSlots ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : slotsGrid.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {selectedFloorId
              ? "Tầng này chưa có slot nào"
              : "Vui lòng chọn tầng"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {slotsGrid
            .filter((row) => row && Array.isArray(row))
            .map((row, rowIndex) => (
              <View
                key={`row-${selectedFloorId || 0}-${rowIndex}-${parkingId}`}
                style={styles.gridRow}
              >
                {row.map((slot, colIndex) => {
                  const uniqueKey = slot && slot.id
                    ? `slot-${slot.id}-${selectedFloorId || 0}-${parkingId}`
                    : `empty-${selectedFloorId || 0}-${rowIndex}-${colIndex}-${parkingId}`;
                  return (
                    <View key={uniqueKey} style={styles.gridCell}>
                      {slot && slot.id ? (
                        <SlotGridCell slot={slot} onPress={handleSlotPress} />
                      ) : (
                        <View style={styles.emptyCell} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
        </ScrollView>
      )}

      {/* Slot Detail Dialog */}
      <Portal>
        <Dialog
          visible={showSlotDialog}
          onDismiss={() => {
            setShowSlotDialog(false);
            setSelectedSlot(null);
          }}
        >
          <Dialog.Title>
            Vị trí {selectedSlot?.name}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              <Text style={styles.boldText}>Trạng thái: </Text>
              {selectedSlot?.isBooked === 1 || selectedSlot?.isBooked === true
                ? "Đã đặt"
                : selectedSlot?.isDisabled || selectedSlot?.status === "Disabled"
                ? "Vô hiệu hóa"
                : selectedSlot?.isBackup
                ? "Backup"
                : "Trống"}
            </Paragraph>
            {selectedSlot?.licensePlate && (
              <Paragraph>
                <Text style={styles.boldText}>Biển số: </Text>
                {selectedSlot.licensePlate}
              </Paragraph>
            )}
            {selectedSlot?.customerName && (
              <Paragraph>
                <Text style={styles.boldText}>Khách hàng: </Text>
                {selectedSlot.customerName}
              </Paragraph>
            )}
            {selectedSlot?.startTime && (
              <Paragraph>
                <Text style={styles.boldText}>Giờ bắt đầu: </Text>
                {selectedSlot.startTime}
              </Paragraph>
            )}
            {selectedSlot?.endTime && (
              <Paragraph>
                <Text style={styles.boldText}>Giờ kết thúc: </Text>
                {selectedSlot.endTime}
              </Paragraph>
            )}
            {selectedSlot?.disabledReason && (
              <Paragraph>
                <Text style={styles.boldText}>Lý do vô hiệu: </Text>
                {selectedSlot.disabledReason}
              </Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSlotDialog(false)}>Đóng</Button>
            {selectedSlot?.bookingId && (
              <Button onPress={handleViewBooking} mode="contained">
                Xem booking
              </Button>
            )}
            {selectedSlot?.isDisabled || selectedSlot?.status === "Disabled" ? (
              <Button onPress={handleEnableSlot} mode="contained" buttonColor="#4caf50">
                Kích hoạt
              </Button>
            ) : (
              <Button onPress={handleDisableSlot} mode="contained" buttonColor="#ff9800">
                Vô hiệu hóa
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>

        {/* Disable Dialog */}
        <Dialog
          visible={showDisableDialog}
          onDismiss={() => {
            setShowDisableDialog(false);
            setDisableReason("");
          }}
        >
          <Dialog.Title>Vô hiệu hóa vị trí</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Vị trí: <Text style={styles.boldText}>{selectedSlot?.name}</Text>
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
                setDisableReason("");
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

        {/* Enable Dialog */}
        <Dialog
          visible={showEnableDialog}
          onDismiss={() => {
            setShowEnableDialog(false);
          }}
        >
          <Dialog.Title>Kích hoạt vị trí</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Vị trí: <Text style={styles.boldText}>{selectedSlot?.name}</Text>
            </Paragraph>
            <Paragraph>
              Bạn có chắc chắn muốn kích hoạt vị trí này không?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowEnableDialog(false);
              }}
            >
              Hủy
            </Button>
            <Button
              onPress={handleConfirmEnable}
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
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  floorCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  floorList: {
    gap: 8,
  },
  floorChip: {
    marginRight: 8,
    backgroundColor: "#e0e0e0",
  },
  floorChipSelected: {
    backgroundColor: "#6200ee",
  },
  floorChipText: {
    color: "#212121",
  },
  floorChipTextSelected: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: GRID_PADDING,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  gridCell: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    marginRight: 8,
  },
  slotCell: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    minHeight: SLOT_SIZE,
  },
  slotName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  slotStatus: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.9,
  },
  slotPlate: {
    color: "#fff",
    fontSize: 9,
    marginTop: 4,
    opacity: 0.8,
  },
  emptyCell: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  emptyText: {
    color: "#757575",
    textAlign: "center",
  },
  errorText: {
    color: "#f44336",
  },
  boldText: {
    fontWeight: "bold",
  },
  dialogInput: {
    marginTop: 16,
  },
});

