import React, { useEffect, useState, useCallback } from 'react';
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
  SegmentedButtons,
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

export default function StatisticsDashboardScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { statisticCard, pieChartData, revenueChartData, isLoading, error } =
    useSelector((state: RootState) => state.statistics);

  const managerId = user?.id || 0;
  const [refreshing, setRefreshing] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    if (managerId > 0) {
      loadStatistics();
    }
  }, [managerId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadStatistics = useCallback(() => {
    if (managerId > 0) {
      dispatch(getStatisticCard(managerId));
      dispatch(getPieChartDoneCancel(managerId));
      const params: any = { managerId };
      if (revenuePeriod === 'week') {
        params.week = selectedWeek;
      } else {
        params.month = selectedMonth;
      }
      dispatch(getRevenueChart(params));
    }
  }, [dispatch, managerId, revenuePeriod, selectedMonth, selectedWeek]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadStatistics().finally(() => {
      setRefreshing(false);
    });
  }, [loadStatistics]);

  const handleRevenuePeriodChange = (value: string) => {
    setRevenuePeriod(value as 'week' | 'month');
    if (value === 'week') {
      // Load week data
      dispatch(getRevenueChart({ managerId, week: selectedWeek }));
    } else {
      // Load month data
      dispatch(getRevenueChart({ managerId, month: selectedMonth }));
    }
  };

  const totalBookings = pieChartData?.total || 0;
  const doneBookings = pieChartData?.done || 0;
  const cancelBookings = pieChartData?.cancel || 0;
  const pendingBookings = pieChartData?.pending || 0;

  const donePercentage =
    totalBookings > 0 ? ((doneBookings / totalBookings) * 100).toFixed(1) : '0';
  const cancelPercentage =
    totalBookings > 0
      ? ((cancelBookings / totalBookings) * 100).toFixed(1)
      : '0';
  const pendingPercentage =
    totalBookings > 0
      ? ((pendingBookings / totalBookings) * 100).toFixed(1)
      : '0';

  if (isLoading && !statisticCard) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Overview Cards */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Tổng quan
        </Text>
        <View style={styles.cardRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon name="parking" size={32} color="#6200ee" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statisticCard?.totalParkings || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Tổng bãi đỗ
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon name="calendar-check" size={32} color="#4caf50" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statisticCard?.totalBookings || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Tổng booking
              </Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.cardRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon name="currency-usd" size={32} color="#ff9800" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {formatCurrency(statisticCard?.totalRevenue || 0)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Tổng doanh thu
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon name="account-group" size={32} color="#2196f3" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statisticCard?.activeKeepers || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Keeper hoạt động
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Revenue Cards */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Doanh thu
        </Text>
        <View style={styles.cardRow}>
          <Card style={styles.revenueCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.revenueLabel}>
                Hôm nay
              </Text>
              <Text variant="headlineSmall" style={styles.revenueValue}>
                {formatCurrency(statisticCard?.todayRevenue || 0)}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.revenueCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.revenueLabel}>
                Tuần này
              </Text>
              <Text variant="headlineSmall" style={styles.revenueValue}>
                {formatCurrency(statisticCard?.weekRevenue || 0)}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.revenueCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.revenueLabel}>
                Tháng này
              </Text>
              <Text variant="headlineSmall" style={styles.revenueValue}>
                {formatCurrency(statisticCard?.monthRevenue || 0)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Booking Statistics */}
      {pieChartData && totalBookings > 0 && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Thống kê Booking
          </Text>
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.pieChartContainer}>
                <View style={styles.pieChartItem}>
                  <Chip
                    icon="check-circle"
                    style={[styles.chip, styles.doneChip]}
                  >
                    Hoàn thành: {doneBookings} ({donePercentage}%)
                  </Chip>
                </View>
                <View style={styles.pieChartItem}>
                  <Chip
                    icon="close-circle"
                    style={[styles.chip, styles.cancelChip]}
                  >
                    Đã hủy: {cancelBookings} ({cancelPercentage}%)
                  </Chip>
                </View>
                {pendingBookings > 0 && (
                  <View style={styles.pieChartItem}>
                    <Chip
                      icon="clock-outline"
                      style={[styles.chip, styles.pendingChip]}
                    >
                      Chờ duyệt: {pendingBookings} ({pendingPercentage}%)
                    </Chip>
                  </View>
                )}
              </View>
              <Text variant="bodySmall" style={styles.totalText}>
                Tổng cộng: {totalBookings} booking
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Revenue Chart Section */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Doanh thu theo {revenuePeriod === 'week' ? 'tuần' : 'tháng'}
        </Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <SegmentedButtons
              value={revenuePeriod}
              onValueChange={handleRevenuePeriodChange}
              buttons={[
                {
                  value: 'week',
                  label: 'Tuần',
                  icon: 'calendar-week',
                },
                {
                  value: 'month',
                  label: 'Tháng',
                  icon: 'calendar-month',
                },
              ]}
              style={styles.segmentedButtons}
            />
            {revenueChartData && revenueChartData.revenues && (
              <View style={styles.revenueChartContainer}>
                {revenueChartData.revenues.length > 0 ? (
                  revenueChartData.revenues.map((revenue, index) => (
                    <View key={index} style={styles.revenueBarItem}>
                      <View style={styles.revenueBarContainer}>
                        <View
                          style={[
                            styles.revenueBar,
                            {
                              height: `${
                                (revenue /
                                  Math.max(...revenueChartData.revenues!)) *
                                100
                              }%`,
                              maxHeight: 200,
                            },
                          ]}
                        />
                      </View>
                      <Text variant="bodySmall" style={styles.revenueLabel}>
                        {revenueChartData.labels?.[index] || `D${index + 1}`}
                      </Text>
                      <Text variant="bodySmall" style={styles.revenueAmount}>
                        {formatCurrency(revenue)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text variant="bodyMedium" style={styles.noDataText}>
                    Chưa có dữ liệu doanh thu
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.actionsTitle}>
              Thao tác nhanh
            </Text>
            <View style={styles.actionsRow}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('RevenueChart' as never)}
                icon="chart-line"
                style={styles.actionButton}
              >
                Xem biểu đồ
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('BookingStatistics' as never)}
                icon="chart-pie"
                style={styles.actionButton}
              >
                Thống kê booking
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#212121',
  },
  statLabel: {
    marginTop: 4,
    color: '#757575',
  },
  revenueCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  revenueLabel: {
    color: '#757575',
    marginBottom: 8,
  },
  revenueValue: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  pieChartContainer: {
    marginVertical: 16,
  },
  pieChartItem: {
    marginBottom: 12,
  },
  chip: {
    height: 40,
    paddingHorizontal: 8,
  },
  doneChip: {
    backgroundColor: '#4caf50',
  },
  cancelChip: {
    backgroundColor: '#f44336',
  },
  pendingChip: {
    backgroundColor: '#ff9800',
  },
  totalText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#757575',
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  revenueChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 250,
    marginTop: 16,
  },
  revenueBarItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  revenueBarContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueBar: {
    width: '80%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
    minHeight: 20,
  },
  revenueAmount: {
    marginTop: 4,
    color: '#212121',
    fontWeight: '500',
    fontSize: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#757575',
    padding: 32,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
  },
  actionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

