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
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { conflictRequestApi, ConflictRequest } from '../../services/api/endpoints/conflictRequestApi';
import { format, parse } from 'date-fns';
import { DATE_FORMATS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ConflictRequestListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();

  const keeperId = user?.id || 0;

  const [conflictRequests, setConflictRequests] = useState<ConflictRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (keeperId > 0) {
      loadConflictRequests(1);
    }
  }, [keeperId]);

  const loadConflictRequests = async (page: number = 1, append: boolean = false) => {
    if (keeperId === 0) return;

    setIsLoading(true);
    try {
      const response = await conflictRequestApi.getConflictRequests({
        keeperId,
        pageNo: page,
        pageSize: DEFAULT_PAGE_SIZE,
      });

      if (response && response.data) {
        if (append) {
          setConflictRequests((prev) => [...prev, ...response.data]);
        } else {
          setConflictRequests(response.data);
        }

        // Check if there's more data
        const totalPages = Math.ceil((response.count || 0) / DEFAULT_PAGE_SIZE);
        setHasMore(page < totalPages);
        setPageNo(page);
      }
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể tải danh sách conflict request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConflictRequests(1, false);
    setRefreshing(false);
  }, [keeperId]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && keeperId > 0) {
      loadConflictRequests(pageNo + 1, true);
    }
  }, [isLoading, hasMore, pageNo, keeperId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return '#4caf50';
      case 'Pending':
        return '#ff9800';
      case 'Rejected':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return 'Đã xử lý';
      case 'Pending':
        return 'Chờ xử lý';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  if (keeperId === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  const renderConflictRequest = ({ item }: { item: ConflictRequest }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          // TODO: Navigate to conflict detail if needed
          console.log('Conflict request:', item.id);
        }}
      >
        <Card style={styles.conflictCard}>
          <Card.Content>
            <View style={styles.conflictHeader}>
              <View style={styles.conflictInfo}>
                <Text variant="titleMedium" style={styles.conflictId}>
                  Conflict #{item.id}
                </Text>
                {item.bookingCode && (
                  <Text variant="bodySmall" style={styles.bookingCode}>
                  Đặt chỗ: #{item.bookingCode}
                  </Text>
                )}
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
                textStyle={{ color: '#fff', fontSize: 12 }}
              >
                {getStatusLabel(item.status)}
              </Chip>
            </View>

            <View style={styles.conflictDetails}>
              {item.customerName && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="account" size={16} color="#757575" />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {item.customerName}
                  </Text>
                </View>
              )}

              {item.customerPhone && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#757575" />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {item.customerPhone}
                  </Text>
                </View>
              )}

              {item.licensePlate && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="car" size={16} color="#757575" />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {item.licensePlate}
                  </Text>
                </View>
              )}

              {item.slotName && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="parking" size={16} color="#757575" />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    Vị trí: {item.slotName}
                  </Text>
                </View>
              )}

              {item.reason && (
                <View style={styles.reasonContainer}>
                  <Text variant="bodySmall" style={styles.reasonLabel}>
                    Lý do:
                  </Text>
                  <Text variant="bodySmall" style={styles.reasonText}>
                    {item.reason}
                  </Text>
                </View>
              )}

              <View style={styles.timeRow}>
                <Text variant="bodySmall" style={styles.timeText}>
                  Tạo: {format(parse(item.createdAt, "yyyy-MM-dd'T'HH:mm:ss", new Date()), 'dd/MM/yyyy HH:mm')}
                </Text>
                {item.resolvedAt && (
                  <Text variant="bodySmall" style={styles.timeText}>
                    Xử lý: {format(parse(item.resolvedAt, "yyyy-MM-dd'T'HH:mm:ss", new Date()), 'dd/MM/yyyy HH:mm')}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && conflictRequests.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : conflictRequests.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="check-circle-outline" size={64} color="#757575" />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Không có conflict request nào
          </Text>
          <Text variant="bodySmall" style={styles.emptyText}>
            Tất cả booking đều hoạt động bình thường
          </Text>
        </View>
      ) : (
        <FlatList
          data={conflictRequests}
          keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `conflict-${index}`)}
          renderItem={renderConflictRequest}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && conflictRequests.length > 0 ? (
              <ActivityIndicator size="small" color="#6200ee" style={styles.footerLoader} />
            ) : null
          }
        />
      )}
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
  listContainer: {
    padding: 16,
  },
  conflictCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conflictInfo: {
    flex: 1,
  },
  conflictId: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingCode: {
    color: '#757575',
  },
  statusChip: {
    height: 28,
  },
  conflictDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#424242',
  },
  reasonContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 4,
  },
  reasonLabel: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#e65100',
  },
  reasonText: {
    color: '#424242',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  timeText: {
    color: '#757575',
  },
  emptyTitle: {
    marginTop: 16,
    color: '#757575',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
});