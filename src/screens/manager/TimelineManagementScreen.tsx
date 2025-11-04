import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PricingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getTimelinesByPrice,
  createTimeline,
  deleteTimeline,
  clearError,
} from '../../store/slices/pricingSlice';
import { Timeline } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';

export default function TimelineManagementScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PricingStackParamList, 'TimelineManagement'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { timelines, isLoading, error } = useSelector(
    (state: RootState) => state.pricing
  );

  const parkingPriceId = route.params?.parkingPriceId || 0;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (parkingPriceId > 0) {
      loadTimelines();
    }
  }, [parkingPriceId]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadTimelines = useCallback(() => {
    if (parkingPriceId > 0) {
      dispatch(getTimelinesByPrice(parkingPriceId));
    }
  }, [dispatch, parkingPriceId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTimelines().finally(() => {
      setRefreshing(false);
    });
  }, [loadTimelines]);

  const handleCreateTimeline = () => {
    navigation.navigate('CreateEditTimeline' as never, { parkingPriceId } as never);
  };

  const handleDeleteTimeline = (timeline: Timeline) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa timeline này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTimeline(timeline.id)).unwrap();
              toast.showSuccess('Đã xóa timeline thành công');
              loadTimelines();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể xóa timeline');
            }
          },
        },
      ]
    );
  };

  const renderTimelineCard = ({ item }: { item: Timeline }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.timeRange}>
            <Text variant="titleMedium" style={styles.timeText}>
              {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
            </Text>
            <Chip
              icon={item.isActive ? 'check-circle' : 'close-circle'}
              style={[
                styles.statusChip,
                item.isActive ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              {item.isActive ? 'Hoạt động' : 'Vô hiệu'}
            </Chip>
          </View>
          <Text variant="headlineSmall" style={styles.priceText}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        {item.description && (
          <Text variant="bodySmall" style={styles.description}>
            {item.description}
          </Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          compact
          onPress={() => handleDeleteTimeline(item)}
          icon="delete"
          textColor="#f44336"
        >
          Xóa
        </Button>
      </Card.Actions>
    </Card>
  );

  if (isLoading && timelines.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách timeline...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={timelines}
        renderItem={renderTimelineCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có timeline nào. Hãy tạo timeline đầu tiên!
              </Text>
            </Card.Content>
          </Card>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTimeline}
        label="Timeline mới"
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
    marginBottom: 8,
  },
  timeRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#757575',
  },
  priceText: {
    fontWeight: 'bold',
    color: '#6200ee',
    fontSize: 20,
  },
  description: {
    color: '#757575',
    marginTop: 8,
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

