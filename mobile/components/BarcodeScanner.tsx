import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type Props = {
  onScanned: (barcode: string) => void;
  onClose: () => void;
};

export function BarcodeScanner({ onScanned, onClose }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.text}>Camera access needed to scan barcodes</Text>
        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'upc_a', 'upc_e', 'code128', 'code39'] }}
        onBarcodeScanned={handleBarCodeScanned}
      />
      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Scan Barcode</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.hint}>Point at any product barcode</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  text: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scanFrame: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.accentLight,
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});
