import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getPieChartDoneCancel,
  clearError,
} from '../../store/slices/statisticsSlice';
import { useAuth } from '../../hooks/useAuth';

export default function BookingStatisticsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { pieChartData, isLoading, error } = useSelector(
    (state: RootState) => state.statistics
  );

  const managerId = user?.id || 0;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (managerId > 0) {
      loadBookingStatistics();
    }
  }, [managerId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadBookingStatistics = useCallback(() => {
    if (managerId > 0) {
      dispatch(getPieChartDoneCancel(managerId));
    }
  }, [dispatch, managerId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookingStatistics().finally(() => {
      setRefreshing(false);
    });
  }, [loadBookingStatistics]);

  if (isLoading && !pieChartData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

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

  const successRate =
    totalBookings > 0
      ? ((doneBookings / totalBookings) * 100).toFixed(1)
      : '0';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Summary Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Thống kê Booking
          </Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text variant="headlineLarge" style={styles.summaryValue}>
                {totalBookings}
              </Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Tổng booking
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="headlineLarge" style={[styles.summaryValue, styles.successValue]}>
                {successRate}%
              </Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Tỷ lệ thành công
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Status Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Phân tích trạng thái
          </Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Chip
                icon="check-circle"
                style={[styles.statusChip, styles.doneChip]}
              >
                Hoàn thành
              </Chip>
              <View style={styles.statusDetails}>
                <Text variant="headlineSmall" style={styles.statusValue}>
                  {doneBookings}
                </Text>
                <Text variant="bodySmall" style={styles.statusPercentage}>
                  {donePercentage}%
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Chip
                icon="close-circle"
                style={[styles.statusChip, styles.cancelChip]}
              >
                Đã hủy
              </Chip>
              <View style={styles.statusDetails}>
                <Text variant="headlineSmall" style={styles.statusValue}>
                  {cancelBookings}
                </Text>
                <Text variant="bodySmall" style={styles.statusPercentage}>
                  {cancelPercentage}%
                </Text>
              </View>
            </View>
            {pendingBookings > 0 && (
              <View style={styles.statusItem}>
                <Chip
                  icon="clock-outline"
                  style={[styles.statusChip, styles.pendingChip]}
                >
                  Chờ duyệt
                </Chip>
                <View style={styles.statusDetails}>
                  <Text variant="headlineSmall" style={styles.statusValue}>
                    {pendingBookings}
                  </Text>
                  <Text variant="bodySmall" style={styles.statusPercentage}>
                    {pendingPercentage}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Visual Representation */}
      {totalBookings > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Biểu diễn trực quan
            </Text>
            <View style={styles.visualContainer}>
              {/* Done Bar */}
              {doneBookings > 0 && (
                <View style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text variant="bodyMedium" style={styles.barLabel}>
                      Hoàn thành
                    </Text>
                    <Text variant="bodyMedium" style={styles.barPercentage}>
                      {donePercentage}%
                    </Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.doneBar,
                        {
                          width: `${donePercentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Cancel Bar */}
              {cancelBookings > 0 && (
                <View style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text variant="bodyMedium" style={styles.barLabel}>
                      Đã hủy
                    </Text>
                    <Text variant="bodyMedium" style={styles.barPercentage}>
                      {cancelPercentage}%
                    </Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.cancelBar,
                        {
                          width: `${cancelPercentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Pending Bar */}
              {pendingBookings > 0 && (
                <View style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text variant="bodyMedium" style={styles.barLabel}>
                      Chờ duyệt
                    </Text>
                    <Text variant="bodyMedium" style={styles.barPercentage}>
                      {pendingPercentage}%
                    </Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.pendingBar,
                        {
                          width: `${pendingPercentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {totalBookings === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.noDataText}>
              Chưa có dữ liệu booking để thống kê
            </Text>
          </Card.Content>
        </Card>
      )}
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
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#212121',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  successValue: {
    color: '#4caf50',
  },
  summaryLabel: {
    marginTop: 8,
    color: '#757575',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusChip: {
    height: 36,
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
  statusDetails: {
    alignItems: 'flex-end',
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  statusPercentage: {
    marginTop: 4,
    color: '#757575',
  },
  visualContainer: {
    marginTop: 16,
  },
  barItem: {
    marginBottom: 24,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabel: {
    fontWeight: '500',
    color: '#212121',
  },
  barPercentage: {
    fontWeight: 'bold',
    color: '#757575',
  },
  barContainer: {
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 16,
  },
  doneBar: {
    backgroundColor: '#4caf50',
  },
  cancelBar: {
    backgroundColor: '#f44336',
  },
  pendingBar: {
    backgroundColor: '#ff9800',
  },
  noDataText: {
    textAlign: 'center',
    color: '#757575',
    padding: 32,
  },
});

