import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Text, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BookingStackParamList } from '../../navigation/types';
import { useToast } from '../../hooks/useToast';

type QRScannerScreenNavigationProp = StackNavigationProp<BookingStackParamList>;

export default function QRScannerScreen() {
  const navigation = useNavigation<QRScannerScreenNavigationProp>();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    
    // Parse QR code format: pz-<id>
    // Example: pz-123 or pz-456
    const match = data.match(/^pz-(\d+)$/i);
    
    if (match) {
      const bookingId = parseInt(match[1], 10);
      
      if (isNaN(bookingId) || bookingId <= 0) {
        toast.showError('Mã QR không hợp lệ');
        setScanned(false);
        return;
      }

      // Navigate to BookingDetail with bookingId
      navigation.navigate('BookingDetail' as never, { bookingId } as never);
      
      // Reset scanned state after navigation
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    } else {
      // QR code format không đúng
      toast.showError('Mã QR không đúng định dạng. Vui lòng quét lại mã QR từ ứng dụng khách hàng.');
      setScanned(false);
    }
  };

  if (permission === null) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Quét mã QR" />
        </Appbar.Header>
        <View style={styles.centerContent}>
          <Text>Đang yêu cầu quyền truy cập camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Quét mã QR" />
        </Appbar.Header>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#757575" />
          <Text style={styles.errorText}>Không có quyền truy cập camera</Text>
          <Text style={styles.errorSubtext}>
            Vui lòng cấp quyền camera trong cài đặt để sử dụng tính năng quét QR
          </Text>
          <Button
            mode="contained"
            onPress={requestPermission}
            style={{ marginTop: 16 }}
          >
            Cấp quyền camera
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quét mã QR" />
      </Appbar.Header>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={StyleSheet.absoluteFillObject}
          enableTorch={flashOn}
          facing={cameraType}
        />
        
        {/* Overlay với khung quét */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Đưa mã QR vào khung để quét
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Button
          mode="outlined"
          onPress={() => setFlashOn(!flashOn)}
          icon={flashOn ? 'flashlight' : 'flashlight-off'}
          style={styles.controlButton}
        >
          {flashOn ? 'Tắt đèn' : 'Bật đèn'}
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
          icon="camera-flip"
          style={styles.controlButton}
        >
          Đổi camera
        </Button>

        {scanned && (
          <Button
            mode="contained"
            onPress={() => setScanned(false)}
            style={styles.controlButton}
          >
            Quét lại
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#6200ee',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

