import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface BookingSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function BookingSearch({ value, onChangeText, onClear }: BookingSearchProps) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm booking..."
        onChangeText={onChangeText}
        value={value}
        onClear={onClear}
        style={styles.searchbar}
        inputStyle={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    elevation: 2,
  },
  input: {
    fontSize: 14,
  },
});

