import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { KeeperManagementStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getKeeperDetail,
  deleteKeeper,
  clearError,
  setCurrentKeeper,
} from '../../store/slices/keeperSlice';
import { useToast } from '../../hooks/useToast';

export default function KeeperDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<KeeperManagementStackParamList, 'KeeperDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { currentKeeper, isLoading, error } = useSelector(
    (state: RootState) => state.keeper
  );

  const keeperId = route.params?.keeperId || 0;

  useEffect(() => {
    if (keeperId > 0) {
      dispatch(getKeeperDetail(keeperId));
    }
    return () => {
      dispatch(setCurrentKeeper(null));
    };
  }, [keeperId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const handleDelete = () => {
    if (!currentKeeper) return;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${currentKeeper.isActive ? 'vô hiệu hóa' : 'kích hoạt'} keeper này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteKeeper(currentKeeper.id)).unwrap();
              toast.showSuccess('Cập nhật keeper thành công');
              navigation.goBack();
            } catch (err: any) {
              toast.showError(err.message || 'Không thể cập nhật keeper');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !currentKeeper) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thông tin keeper...</Text>
      </View>
    );
  }

  if (!currentKeeper) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy keeper</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.keeperName}>
              {currentKeeper.name}
            </Text>
            <Chip
              icon={currentKeeper.isActive ? 'check-circle' : 'close-circle'}
              style={[
                styles.statusChip,
                currentKeeper.isActive ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              {currentKeeper.isActive ? 'Hoạt động' : 'Vô hiệu'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin keeper
            </Text>
            <InfoRow label="ID" value={currentKeeper.id.toString()} />
            <InfoRow label="Email" value={currentKeeper.email} />
            {currentKeeper.phone && <InfoRow label="SĐT" value={currentKeeper.phone} />}
            {currentKeeper.managerName && (
              <InfoRow label="Manager" value={currentKeeper.managerName} />
            )}
            {currentKeeper.createdAt && (
              <InfoRow
                label="Tạo lúc"
                value={new Date(currentKeeper.createdAt).toLocaleString('vi-VN')}
              />
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleDelete}
          style={styles.actionButton}
          icon={currentKeeper.isActive ? 'close-circle' : 'check-circle'}
          buttonColor={currentKeeper.isActive ? '#f44336' : '#4caf50'}
          disabled={isLoading}
          loading={isLoading}
        >
          {currentKeeper.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
        </Button>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}:
      </Text>
      <Text variant="bodyLarge" style={styles.value}>
        {value}
      </Text>
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
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  keeperName: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 32,
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#757575',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    color: '#757575',
    fontWeight: '500',
    minWidth: 120,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: '#212121',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

