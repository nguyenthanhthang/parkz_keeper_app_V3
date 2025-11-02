import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ParkingStackParamList } from '../../navigation/types';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';

export default function MapPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParkingStackParamList, 'MapPicker'>>();
  const { initialLatitude, initialLongitude } = route.params || {};
  const [latitude, setLatitude] = useState<number>(initialLatitude || 10.8231); // Default: Ho Chi Minh City
  const [longitude, setLongitude] = useState<number>(initialLongitude || 106.6297);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng này',
          [{ text: 'OK' }]
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLatitude = location.coords.latitude;
      const newLongitude = location.coords.longitude;
      
      setLatitude(newLatitude);
      setLongitude(newLongitude);

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: newLatitude,
          longitude: newLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!initialLatitude || !initialLongitude) {
      getCurrentLocation();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude: newLat, longitude: newLng } = event.nativeEvent.coordinate;
    setLatitude(newLat);
    setLongitude(newLng);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude: newLat, longitude: newLng } = event.nativeEvent.coordinate;
    setLatitude(newLat);
    setLongitude(newLng);
  };

  const handleConfirm = () => {
    // Return location via navigation - go back with params
    navigation.navigate('CreateEditParking' as never, {
      selectedLatitude: latitude,
      selectedLongitude: longitude,
    } as never);
  };

  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // iOS: Dùng react-native-maps với provider={undefined} (Apple Maps - không cần API key)
  // Android: Dùng react-native-maps với custom tiles (OpenStreetMap) - không cần API key
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
          <Text variant="titleMedium" style={styles.title}>
            Chọn vị trí bãi đỗ
          </Text>
          <View style={styles.headerRight}>
            {loadingLocation && <ActivityIndicator size="small" />}
            <IconButton
              icon="crosshairs-gps"
              size={24}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            />
          </View>
        </View>

        {/* Map - iOS: Apple Maps (không cần API key) */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            mapType="standard"
          >
            <Marker
              coordinate={{ latitude, longitude }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              title="Chọn vị trí bãi đỗ"
            />
          </MapView>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
            </View>
          )}
        </View>

        {/* Info & Confirm */}
        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            <Text variant="bodySmall" style={styles.infoLabel}>
              Vĩ độ: {latitude.toFixed(6)}
            </Text>
            <Text variant="bodySmall" style={styles.infoLabel}>
              Kinh độ: {longitude.toFixed(6)}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            buttonColor="#6200ee"
            icon="check"
          >
            Xác nhận vị trí
          </Button>
        </View>
      </View>
    );
  }

  // Android: Dùng react-native-maps với OpenStreetMap tiles (không cần API key)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.title}>
          Chọn vị trí bãi đỗ
        </Text>
        <View style={styles.headerRight}>
          {loadingLocation && <ActivityIndicator size="small" />}
          <IconButton
            icon="crosshairs-gps"
            size={24}
            onPress={getCurrentLocation}
            disabled={loadingLocation}
          />
        </View>
      </View>

      {/* Map - Android: OpenStreetMap tiles (không cần API key) */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          // Android: Không dùng provider để tránh yêu cầu Google Maps API key
          // Sử dụng custom tiles từ OpenStreetMap
        >
          {/* Custom tiles từ OpenStreetMap - không cần API key */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            zIndex={-1}
          />
          <Marker
            coordinate={{ latitude, longitude }}
            draggable
            onDragEnd={handleMarkerDragEnd}
            title="Chọn vị trí bãi đỗ"
          />
        </MapView>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        )}
      </View>

      {/* Info & Confirm */}
      <View style={styles.footer}>
        <View style={styles.infoContainer}>
          <Text variant="bodySmall" style={styles.infoLabel}>
            Vĩ độ: {latitude.toFixed(6)}
          </Text>
          <Text variant="bodySmall" style={styles.infoLabel}>
            Kinh độ: {longitude.toFixed(6)}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleConfirm}
          style={styles.confirmButton}
          buttonColor="#6200ee"
          icon="check"
        >
          Xác nhận vị trí
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#757575',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
  },
  infoContainer: {
    marginBottom: 12,
    gap: 4,
  },
  infoLabel: {
    color: '#757575',
  },
  confirmButton: {
    paddingVertical: 4,
  },
});
