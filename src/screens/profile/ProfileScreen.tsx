import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Divider, Button } from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { UserRole } from "../../types";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.showSuccess("Đăng xuất thành công");
    } catch (error: any) {
      toast.showError(error?.message || "Đăng xuất thất bại");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  const roleLabel =
    user.role === UserRole.KEEPER ||
    user.role === "Keeper" ||
    user.role === "KEEPER"
      ? "Nhân viên"
      : user.role === UserRole.MANAGER ||
        user.role === "Manager" ||
        user.role === "MANAGER"
      ? "Quản lý"
      : user.role || "N/A";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Thông tin cá nhân
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Hồ sơ của bạn
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Tên:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {user.name || "Chưa có"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Email:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {user.email || "Chưa có"}
              </Text>
            </View>

            {user.phone && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Số điện thoại:
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {user.phone}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Vai trò:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {roleLabel}
              </Text>
            </View>

            {user.parkingName && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Bãi đỗ:
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {user.parkingName}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#d32f2f"
        >
          Đăng xuất
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#757575",
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#757575",
    flex: 1,
  },
  value: {
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  buttonContainer: {
    paddingVertical: 16,
  },
  logoutButton: {
    paddingVertical: 4,
  },
});
