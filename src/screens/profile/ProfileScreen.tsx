import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const isManager = user?.role === UserRole.MANAGER;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigateToBusinessProfile = () => {
    // Navigate trong cùng ProfileStack (ProfileStackNavigator)
    navigation.navigate('BusinessProfile' as never);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Hồ sơ
          </Text>
          {user && (
            <View style={styles.info}>
              <Text variant="bodyLarge">Tên: {user.name}</Text>
              <Text variant="bodyLarge">Email: {user.email}</Text>
              {user.phone && (
                <Text variant="bodyLarge">Số điện thoại: {user.phone}</Text>
              )}
              <Text variant="bodyLarge">Vai trò: {user.role === 'Manager' ? 'Quản lý' : user.role === 'Keeper' ? 'Nhân viên' : user.role}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {isManager && (
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleNavigateToBusinessProfile}
              style={styles.businessProfileButton}
              buttonColor="#6200ee"
              icon="office-building"
            >
              Hồ sơ Doanh nghiệp
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        buttonColor="#b00020"
      >
        Đăng xuất
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 16,
    gap: 8,
  },
  businessProfileButton: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  button: {
    marginTop: 'auto',
    paddingVertical: 4,
  },
});

