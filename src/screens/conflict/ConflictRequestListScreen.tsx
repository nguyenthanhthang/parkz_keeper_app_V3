import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ConflictRequestListScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Conflict Requests</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        This screen will be implemented in Phase 4
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 16,
    color: '#757575',
  },
});

