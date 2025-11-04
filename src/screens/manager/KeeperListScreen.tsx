import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getKeeperAccounts,
  deleteKeeper,
  clearError,
} from '../../store/slices/keeperSlice';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Alert } from 'react-native';
import { Keeper } from '../../services/api/endpoints/keeperApi';

export default function KeeperListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const toast = useToast();
  const { keepers, isLoading, error } = useSelector(
    (state: RootState) => state.keeper
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadKeepers();
    }
  }, [user?.id]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const loadKeepers = useCallback(() => {
    if (user?.id) {
      dispatch(getKeeperAccounts({ managerId: user.id }));
    }
  }, [dispatch, user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadKeepers().finally(() => {
      setRefreshing(false);
    });
  }, [loadKeepers]);

  const handleKeeperPress = (keeper: Keeper) => {
    navigation.navigate('KeeperDetail' as never, { keeperId: keeper.id } as never);
  };

  const handleCreateKeeper = () => {
    navigation.navigate('CreateKeeper' as never, {} as never);
  };

  const handleDeleteKeeper = (keeper: Keeper) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${keeper.isActive ? 'vô hiệu hóa' : 'kích hoạt'} keeper "${keeper.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteKeeper(keeper.id)).unwrap();
              toast.showSuccess('Cập nhật keeper thành công');
              loadKeepers();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể cập nhật keeper');
            }
          },
        },
      ]
    );
  };

  const renderKeeperCard = ({ item }: { item: Keeper }) => (
    <TouchableOpacity onPress={() => handleKeeperPress(item)}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.keeperName}>
              {item.name}
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
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Email:</Text>
            <Text variant="bodyMedium">{item.email}</Text>
          </View>
          {item.phone && (
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>SĐT:</Text>
              <Text variant="bodyMedium">{item.phone}</Text>
            </View>
          )}
        </Card.Content>
        <Card.Actions>
          <Chip
            onPress={() => handleDeleteKeeper(item)}
            style={styles.deleteButton}
            icon="delete"
            textStyle={styles.deleteButtonText}
          >
            {item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Chip>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && keepers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải danh sách keeper...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={keepers}
        renderItem={renderKeeperCard}
        keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `keeper-${index}`)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chưa có keeper nào. Hãy tạo keeper đầu tiên!
              </Text>
            </Card.Content>
          </Card>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateKeeper}
        label="Keeper mới"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keeperName: {
    flex: 1,
    fontWeight: 'bold',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#757575',
    minWidth: 80,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#ffffff',
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

