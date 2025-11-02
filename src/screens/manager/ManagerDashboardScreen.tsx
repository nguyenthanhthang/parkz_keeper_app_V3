import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getStatisticCard,
  getPieChartDoneCancel,
  getRevenueChart,
  clearError,
} from '../../store/slices/statisticsSlice';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../../utils/formatters';

export default function ManagerDashboardScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { statisticCard, pieChartData, isLoading, error } = useSelector(
    (state: RootState) => state.statistics
  );

  const managerId = user?.id || 0;

  useEffect(() => {
    if (managerId > 0) {
      loadStatistics();
    }
  }, [managerId]);

  const loadStatistics = useCallback(() => {
    if (managerId > 0) {
      dispatch(getStatisticCard(managerId));
      dispatch(getPieChartDoneCancel(managerId));
      dispatch(getRevenueChart({ managerId, month: new Date().getMonth() + 1 }));
    }
  }, [dispatch, managerId]);

  const handleRefresh = useCallback(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

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
            <Icon name={icon} size={32} color={color} />
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

  const QuickActionButton = ({
    label,
    icon,
    onPress,
    color = '#6200ee',
  }: {
    label: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }) => (
    <Button
      mode="contained"
      onPress={onPress}
      icon={icon}
      style={[styles.quickActionButton, { backgroundColor: color }]}
      contentStyle={styles.quickActionContent}
      labelStyle={styles.quickActionLabel}
    >
      {label}
    </Button>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Xin chào, {user?.name || 'Manager'} 👋
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Tổng quan hệ thống hôm nay
        </Text>
      </View>

      {/* Statistics Cards */}
      {isLoading && !statisticCard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      ) : error && error.includes('Không tìm thấy thông tin doanh nghiệp') ? (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.infoText}>
              ⚠️ Bạn cần tạo Business Profile trước khi xem thống kê.
            </Text>
            <Text variant="bodySmall" style={styles.infoSubtext}>
              Vui lòng liên hệ admin để được hỗ trợ tạo business profile.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              title="Bãi đỗ hoạt động"
              value={statisticCard?.activeParkings || 0}
              icon="parking"
              color="#4caf50"
              onPress={() => {
                // Navigate to ParkingTab (nested stack)
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('ParkingTab' as never);
                }
              }}
            />
            <StatCard
              title="Booking hôm nay"
              value={statisticCard?.todayBookings || 0}
              icon="calendar-today"
              color="#2196f3"
              onPress={() => {
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('BookingTab' as never);
                }
              }}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Doanh thu hôm nay"
              value={formatCurrency(statisticCard?.todayRevenue || 0)}
              icon="cash-multiple"
              color="#ff9800"
            />
            <StatCard
              title="Nhân viên"
              value={statisticCard?.activeKeepers || 0}
              icon="account-group"
              color="#9c27b0"
              onPress={() => {
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('KeeperTab' as never);
                }
              }}
            />
          </View>

          {/* Booking Status */}
          {pieChartData && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.chartTitle}>
                  Trạng thái Booking
                </Text>
                <View style={styles.pieChartContainer}>
                  <View style={styles.pieChartItem}>
                    <Chip
                      icon="check-circle"
                      style={[styles.chip, { backgroundColor: '#4caf50' }]}
                    >
                      Hoàn thành: {pieChartData.done || 0}
                    </Chip>
                  </View>
                  <View style={styles.pieChartItem}>
                    <Chip
                      icon="close-circle"
                      style={[styles.chip, { backgroundColor: '#f44336' }]}
                    >
                      Đã hủy: {pieChartData.cancel || 0}
                    </Chip>
                  </View>
                  {pieChartData.pending !== undefined && (
                    <View style={styles.pieChartItem}>
                      <Chip
                        icon="clock-outline"
                        style={[styles.chip, { backgroundColor: '#ff9800' }]}
                      >
                        Chờ duyệt: {pieChartData.pending || 0}
                      </Chip>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Thao tác nhanh
              </Text>
              <View style={styles.quickActionsRow}>
                <QuickActionButton
                  label="Tạo bãi đỗ"
                  icon="plus-circle"
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate('ParkingTab' as never, {
                        screen: 'CreateEditParking',
                      } as never);
                    }
                  }}
                />
                <QuickActionButton
                  label="Duyệt booking"
                  icon="check-circle"
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate('BookingTab' as never);
                    }
                  }}
                  color="#4caf50"
                />
              </View>
              <View style={styles.quickActionsRow}>
                <QuickActionButton
                  label="Thêm nhân viên"
                  icon="account-plus"
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate('KeeperTab' as never);
                    }
                  }}
                  color="#9c27b0"
                />
                <QuickActionButton
                  label="Xem thống kê"
                  icon="chart-bar"
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate('StatisticsTab' as never);
                    }
                  }}
                  color="#ff9800"
                />
              </View>
            </Card.Content>
          </Card>

          {/* Error Message */}
          {error && (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </Card.Content>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#757575',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  statsRow: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statCardIcon: {
    marginRight: 16,
  },
  statCardText: {
    flex: 1,
  },
  statCardTitle: {
    color: '#757575',
    marginBottom: 4,
  },
  statCardValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  chartCard: {
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pieChartContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pieChartItem: {
    flex: 1,
    minWidth: '30%',
  },
  chip: {
    paddingVertical: 4,
  },
  quickActionsCard: {
    marginTop: 12,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  quickActionContent: {
    paddingVertical: 8,
  },
  quickActionLabel: {
    fontSize: 14,
  },
  errorCard: {
    marginTop: 12,
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
  },
  infoCard: {
    marginTop: 12,
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  infoText: {
    color: '#e65100',
    marginBottom: 8,
  },
  infoSubtext: {
    color: '#bf360c',
  },
});

