import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  SegmentedButtons,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParkingStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getScheduledDisableHistory,
  getSuccessedDisableHistory,
  cancelDisableScheduled,
  clearError,
} from '../../store/slices/parkingSlice';
import { ScheduledDisableHistory, SuccessedDisableHistory } from '../../types';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { Alert } from 'react-native';

export default function DisableHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'DisableHistory'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { 
    scheduledDisableHistory, 
    successedDisableHistory, 
    isLoading,
    error 
  } = useSelector((state: RootState) => state.parking);

  const parkingId = route.params?.parkingId || 0;
  const [historyType, setHistoryType] = useState<'scheduled' | 'successed'>('scheduled');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [parkingId, historyType]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadHistory = async () => {
    try {
      if (historyType === 'scheduled') {
        await dispatch(getScheduledDisableHistory(parkingId)).unwrap();
      } else {
        await dispatch(getSuccessedDisableHistory(parkingId)).unwrap();
      }
    } catch (err: any) {
      toast.showError(err.message || 'Không thể tải lịch sử');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleCancel = (item: ScheduledDisableHistory) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy lịch trình vô hiệu hóa này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                cancelDisableScheduled({
                  parkingId: item.parkingId,
                  scheduledId: item.id,
                })
              ).unwrap();
              toast.showSuccess('Đã hủy lịch trình vô hiệu hóa');
              loadHistory();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể hủy lịch trình');
            }
          },
        },
      ]
    );
  };

  const renderScheduledItem = ({ item }: { item: ScheduledDisableHistory }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.parkingName}>
            {item.parkingName || `Bãi đỗ #${item.parkingId}`}
          </Text>
          <Chip icon="clock" style={styles.scheduledChip}>
            Đã lên lịch
          </Chip>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Từ:</Text>
          <Text variant="bodyMedium">
            {format(new Date(item.startDate), 'dd/MM/yyyy')}
            {item.startTime && ` ${item.startTime.slice(0, 5)}`}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Đến:</Text>
          <Text variant="bodyMedium">
            {format(new Date(item.endDate), 'dd/MM/yyyy')}
            {item.endTime && ` ${item.endTime.slice(0, 5)}`}
          </Text>
        </View>
        {item.reason && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Lý do:</Text>
            <Text variant="bodySmall" style={styles.reason}>
              {item.reason}
            </Text>
          </View>
        )}
        {item.createdAt && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Tạo lúc:</Text>
            <Text variant="bodySmall">
              {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Chip
          onPress={() => handleCancel(item)}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        >
          Hủy lịch trình
        </Chip>
      </Card.Actions>
    </Card>
  );

  const renderSuccessedItem = ({ item }: { item: SuccessedDisableHistory }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.parkingName}>
            {item.parkingName || `Bãi đỗ #${item.parkingId}`}
          </Text>
          <Chip icon="check-circle" style={styles.successedChip}>
            Đã thực hiện
          </Chip>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Từ:</Text>
          <Text variant="bodyMedium">
            {format(new Date(item.startDate), 'dd/MM/yyyy')}
            {item.startTime && ` ${item.startTime.slice(0, 5)}`}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Đến:</Text>
          <Text variant="bodyMedium">
            {format(new Date(item.endDate), 'dd/MM/yyyy')}
            {item.endTime && ` ${item.endTime.slice(0, 5)}`}
          </Text>
        </View>
        {item.reason && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Lý do:</Text>
            <Text variant="bodySmall" style={styles.reason}>
              {item.reason}
            </Text>
          </View>
        )}
        {item.createdAt && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Tạo lúc:</Text>
            <Text variant="bodySmall">
              {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
          </View>
        )}
        {item.completedAt && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Hoàn thành:</Text>
            <Text variant="bodySmall">
              {format(new Date(item.completedAt), 'dd/MM/yyyy HH:mm')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const data = historyType === 'scheduled' ? scheduledDisableHistory : successedDisableHistory;
  const renderItem = historyType === 'scheduled' ? renderScheduledItem : renderSuccessedItem;

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Card.Content>
          <SegmentedButtons
            value={historyType}
            onValueChange={(value) => setHistoryType(value as 'scheduled' | 'successed')}
            buttons={[
              {
                value: 'scheduled',
                label: 'Đã lên lịch',
              },
              {
                value: 'successed',
                label: 'Đã thực hiện',
              },
            ]}
          />
        </Card.Content>
      </Card>

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {historyType === 'scheduled'
                    ? 'Chưa có lịch trình vô hiệu hóa nào'
                    : 'Chưa có lịch sử vô hiệu hóa nào'}
                </Text>
              </Card.Content>
            </Card>
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
  filterCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parkingName: {
    flex: 1,
    fontWeight: 'bold',
  },
  scheduledChip: {
    backgroundColor: '#ff9800',
  },
  succeededChip: {
    backgroundColor: '#4caf50',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    minWidth: 80,
    color: '#757575',
    fontWeight: '500',
  },
  reason: {
    flex: 1,
    color: '#212121',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: '#ffffff',
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
  emptyCard: {
    marginTop: 32,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
});

