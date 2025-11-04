import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  SegmentedButtons,
  Button,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getRevenueChart,
  clearError,
} from '../../store/slices/statisticsSlice';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RevenueChartScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { revenueChartData, isLoading, error } = useSelector(
    (state: RootState) => state.statistics
  );

  const managerId = user?.id || 0;
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    if (managerId > 0) {
      loadRevenueChart();
    }
  }, [managerId, period, selectedMonth, selectedWeek]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadRevenueChart = useCallback(() => {
    if (managerId > 0) {
      const params: any = { managerId };
      if (period === 'week') {
        params.week = selectedWeek;
      } else {
        params.month = selectedMonth;
      }
      dispatch(getRevenueChart(params));
    }
  }, [dispatch, managerId, period, selectedMonth, selectedWeek]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRevenueChart().finally(() => {
      setRefreshing(false);
    });
  }, [loadRevenueChart]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value as 'week' | 'month');
  };

  const maxRevenue =
    revenueChartData?.revenues && revenueChartData.revenues.length > 0
      ? Math.max(...revenueChartData.revenues)
      : 1;

  const totalRevenue =
    revenueChartData?.revenues && revenueChartData.revenues.length > 0
      ? revenueChartData.revenues.reduce((sum, val) => sum + val, 0)
      : 0;

  if (isLoading && !revenueChartData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải biểu đồ...</Text>
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
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Biểu đồ Doanh thu
          </Text>

          <SegmentedButtons
            value={period}
            onValueChange={handlePeriodChange}
            buttons={[
              {
                value: 'week',
                label: 'Theo tuần',
                icon: 'calendar-week',
              },
              {
                value: 'month',
                label: 'Theo tháng',
                icon: 'calendar-month',
              },
            ]}
            style={styles.segmentedButtons}
          />

          {revenueChartData && revenueChartData.revenues ? (
            <>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Tổng doanh thu
                  </Text>
                  <Text variant="headlineSmall" style={styles.summaryValue}>
                    {formatCurrency(totalRevenue)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Trung bình
                  </Text>
                  <Text variant="headlineSmall" style={styles.summaryValue}>
                    {formatCurrency(
                      revenueChartData.revenues.length > 0
                        ? totalRevenue / revenueChartData.revenues.length
                        : 0
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                {revenueChartData.revenues.length > 0 ? (
                  revenueChartData.revenues.map((revenue, index) => {
                    const barHeight =
                      maxRevenue > 0 ? (revenue / maxRevenue) * 250 : 0;
                    return (
                      <View key={index} style={styles.chartBarItem}>
                        <View style={styles.chartBarContainer}>
                          <View
                            style={[
                              styles.chartBar,
                              {
                                height: Math.max(barHeight, 20),
                              },
                            ]}
                          />
                          <Text variant="bodySmall" style={styles.chartValue}>
                            {formatCurrency(revenue)}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.chartLabel}>
                          {revenueChartData.labels?.[index] ||
                            `${period === 'week' ? 'Ngày' : 'Tuần'} ${
                              index + 1
                            }`}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text variant="bodyMedium" style={styles.noDataText}>
                    Chưa có dữ liệu doanh thu
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text variant="bodyMedium" style={styles.noDataText}>
                Chưa có dữ liệu doanh thu cho kỳ đã chọn
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
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
  segmentedButtons: {
    marginBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#757575',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    minHeight: 300,
    paddingVertical: 16,
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartBarContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartBar: {
    width: '70%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
    minHeight: 20,
  },
  chartValue: {
    marginTop: 4,
    color: '#212121',
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
  },
  chartLabel: {
    marginTop: 8,
    color: '#757575',
    fontSize: 11,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 48,
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#757575',
  },
});

