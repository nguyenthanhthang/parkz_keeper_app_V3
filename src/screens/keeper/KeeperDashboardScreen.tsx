import React, { useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Chip,
  FAB,
} from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useBooking } from "../../hooks/useBooking";
import { DEFAULT_PAGE_SIZE } from "../../utils/constants";

// Helper functions for booking status
const getStatusIcon = (status: string): string => {
  switch (status) {
    case "Done":
    case "Completed":
    case "Check_Out":
    case "Success":
      return "check-circle";
    case "Cancel":
    case "Cancelled":
      return "close-circle";
    case "Check_In":
      return "clock-check";
    case "Confirmed":
      return "check";
    case "Pending":
    case "Booked":
      return "clock-outline";
    default:
      return "clock-outline";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Done":
    case "Completed":
    case "Check_Out":
    case "Success":
      return "#4caf50";
    case "Cancel":
    case "Cancelled":
      return "#f44336";
    case "Pending":
    case "Booked":
      return "#ff9800";
    case "Confirmed":
    case "Check_In":
      return "#2196f3";
    default:
      return "#757575";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "Done":
    case "Completed":
    case "Success":
      return "Hoàn thành";
    case "Check_Out":
      return "Đã check-out";
    case "Check_In":
      return "Đã check-in";
    case "Cancel":
    case "Cancelled":
      return "Đã hủy";
    case "Pending":
    case "Booked":
      return "Chờ duyệt";
    case "Confirmed":
      return "Đã xác nhận";
    default:
      return status || "—";
  }
};

export default function KeeperDashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { bookings, isLoading, getAllBookings } = useBooking();
  const keeperId = user?.id || 0;

  useEffect(() => {
    if (keeperId > 0) {
      // Load today's bookings (limited)
      getAllBookings(keeperId, 1, 5); // Only load 5 most recent
    }
  }, [keeperId, getAllBookings]);

  const handleRefresh = useCallback(() => {
    if (keeperId > 0) {
      getAllBookings(keeperId, 1, 5);
    }
  }, [keeperId, getAllBookings]);

  const todayBookings = bookings?.slice(0, 5) || [];
  const todayBookingsCount = bookings?.length || 0;

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.statCard, { borderLeftColor: color }]}>
        <Card.Content style={styles.statCardContent}>
          <View style={styles.statCardIcon}>
            <MaterialCommunityIcons name={icon} size={32} color={color} />
          </View>
          <View style={styles.statCardText}>
            <Text variant="bodySmall" style={styles.statCardTitle}>
              {title}
            </Text>
            <Text variant="headlineSmall" style={styles.statCardValue}>
              {value}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const handleOpenQRScanner = () => {
    // Navigate to QR Scanner in BookingTab stack
    navigation.navigate('BookingTab' as never, {
      screen: 'QRScanner',
    } as never);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Xin chào, {user?.name || "Keeper"} 👋
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Bãi đỗ: {user?.parkingName || "Chưa gán bãi đỗ"}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <StatCard
          title="Booking hôm nay"
          value={todayBookingsCount}
          icon="calendar-today"
          color="#2196f3"
          onPress={() => {
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate("BookingTab" as never);
            }
          }}
        />
        <StatCard
          title="Slot khả dụng"
          value="--"
          icon="parking"
          color="#4caf50"
          onPress={() => {
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate("SlotTab" as never);
            }
          }}
        />
        <StatCard
          title="Xung đột"
          value="0"
          icon="alert-circle"
          color="#ff9800"
          onPress={() => {
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate("ConflictTab" as never);
            }
          }}
        />
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Thao tác nhanh
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              const parentNavigation = navigation.getParent();
              if (parentNavigation) {
                parentNavigation.navigate(
                  "BookingTab" as never,
                  {
                    screen: "CreatePasserbyBooking",
                  } as never
                );
              }
            }}
            icon="plus-circle"
            style={styles.createBookingButton}
            contentStyle={styles.createBookingContent}
            buttonColor="#4caf50"
          >
            Tạo booking mới
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              const parentNavigation = navigation.getParent();
              if (parentNavigation) {
                parentNavigation.navigate("SlotTab" as never);
              }
            }}
            icon="view-grid"
            style={styles.viewSlotsButton}
            contentStyle={styles.viewSlotsContent}
          >
            Xem slot khả dụng
          </Button>
        </Card.Content>
      </Card>

      {/* Today's Bookings */}
      <Card style={styles.bookingsCard}>
        <Card.Content>
          <View style={styles.bookingsHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Booking hôm nay
            </Text>
            <Button
              mode="text"
              onPress={() => {
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate("BookingTab" as never);
                }
              }}
              compact
            >
              Xem tất cả
            </Button>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200ee" />
            </View>
          ) : todayBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có booking nào hôm nay
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {todayBookings.map((booking: any, index: number) => (
                <TouchableOpacity
                  key={booking.id || index}
                  style={styles.bookingItem}
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate(
                        "BookingTab" as never,
                        {
                          screen: "BookingDetail",
                          params: { bookingId: booking.id },
                        } as never
                      );
                    }
                  }}
                >
                  <View style={styles.bookingItemContent}>
                    <View style={styles.bookingItemHeader}>
                      <Text variant="titleMedium" style={styles.bookingId}>
                        Đặt chỗ #{booking.id}
                      </Text>
                      <Chip
                        compact
                        icon={getStatusIcon(booking.status)}
                        style={[
                          styles.statusChip,
                          { backgroundColor: getStatusColor(booking.status) },
                        ]}
                        textStyle={{ color: "#fff" }}
                      >
                        {getStatusLabel(booking.status)}
                      </Chip>
                    </View>
                    {booking.customerName && (
                      <Text variant="bodyMedium" style={styles.customerName}>
                        Khách: {booking.customerName}
                      </Text>
                    )}
                    {booking.phoneNumber && (
                      <Text variant="bodySmall" style={styles.phoneNumber}>
                        SĐT: {booking.phoneNumber}
                      </Text>
                    )}
                    {booking.slotName && (
                      <Text variant="bodySmall" style={styles.slotName}>
                        Slot: {booking.slotName}
                      </Text>
                    )}
                  </View>
                  <View style={styles.chevronWrap}>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#757575"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
      </ScrollView>
      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={handleOpenQRScanner}
        label="Quét QR"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#757575",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  statCardIcon: {
    marginRight: 12,
  },
  statCardText: {
    flex: 1,
  },
  statCardTitle: {
    color: "#757575",
    marginBottom: 4,
    fontSize: 12,
  },
  statCardValue: {
    fontWeight: "bold",
    color: "#212121",
    fontSize: 20,
  },
  quickActionsCard: {
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  createBookingButton: {
    marginBottom: 12,
  },
  createBookingContent: {
    paddingVertical: 8,
  },
  viewSlotsButton: {
    marginBottom: 4,
  },
  viewSlotsContent: {
    paddingVertical: 8,
  },
  bookingsCard: {
    marginTop: 12,
    borderRadius: 8,
    elevation: 2,
  },
  bookingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#757575",
  },
  bookingsList: {
    gap: 12,
  },
  bookingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
  },
  bookingItemContent: {
    flex: 1,
  },
  bookingItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bookingId: {
    fontWeight: "bold",
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  statusChip: {
    height: 28,
    borderRadius: 16,
  },
  chevronWrap: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  customerName: {
    marginBottom: 4,
    color: "#424242",
  },
  phoneNumber: {
    color: "#757575",
    marginBottom: 2,
  },
  slotName: {
    color: "#757575",
  },
});
