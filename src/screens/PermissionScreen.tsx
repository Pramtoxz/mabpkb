import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Linking, PermissionsAndroid, Platform} from 'react-native';
import {useCameraPermission} from 'react-native-vision-camera';
import {Colors, Fonts} from '../constants';

interface PermissionScreenProps {
  onAllGranted: () => void;
}

type PermStatus = 'pending' | 'granted' | 'denied';

interface PermItem {
  key: string;
  label: string;
  status: PermStatus;
}

export default function PermissionScreen({onAllGranted}: PermissionScreenProps) {
  const {hasPermission: hasCamera, requestPermission: requestCamera} = useCameraPermission();
  const [items, setItems] = useState<PermItem[]>([
    {key: 'camera', label: 'Kamera', status: hasCamera ? 'granted' : 'pending'},
    {key: 'notification', label: 'Notifikasi', status: 'pending'},
  ]);

  const checkNotification = useCallback(async (): Promise<PermStatus> => {
    if (Platform.OS !== 'android') {return 'granted';}
    try {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS');
        return result ? 'granted' : 'denied';
      }
      return 'granted';
    } catch {
      return 'granted';
    }
  }, []);

  const refreshStatuses = useCallback(async () => {
    const notifStatus = await checkNotification();
    setItems(prev =>
      prev.map(item => {
        if (item.key === 'camera') {
          return {...item, status: hasCamera ? 'granted' : 'pending'};
        }
        if (item.key === 'notification') {
          return {...item, status: notifStatus};
        }
        return item;
      }),
    );
  }, [hasCamera, checkNotification]);

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  const allGranted = items.every(i => i.status === 'granted');

  useEffect(() => {
    if (allGranted) {
      const timer = setTimeout(onAllGranted, 600);
      return () => clearTimeout(timer);
    }
  }, [allGranted, onAllGranted]);

  const handleRequestAll = async () => {
    if (!hasCamera) {
      await requestCamera();
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
      } catch {}
    }

    setTimeout(refreshStatuses, 500);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MABPKB</Text>
        <Text style={styles.subtitle}>Aplikasi ini memerlukan beberapa izin untuk berjalan dengan baik.</Text>
      </View>

      <View style={styles.list}>
        {items.map(item => (
          <View key={item.key} style={styles.item}>
            <View style={[styles.dot, item.status === 'granted' ? styles.dotOk : styles.dotPending]} />
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={[styles.itemStatus, item.status === 'granted' ? styles.statusOk : styles.statusPending]}>
              {item.status === 'granted' ? 'Diizinkan' : 'Belum diizinkan'}
            </Text>
          </View>
        ))}
      </View>

      {!allGranted && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestAll} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Berikan Izin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleOpenSettings} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Buka Pengaturan</Text>
          </TouchableOpacity>
        </View>
      )}

      {allGranted && (
        <View style={styles.okBadge}>
          <Text style={styles.okText}>Semua izin diizinkan</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.heading.bold,
    fontSize: 32,
    color: Colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    color: Colors.neutral,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    gap: 16,
    marginBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOk: {
    backgroundColor: '#16a34a',
  },
  dotPending: {
    backgroundColor: Colors.border,
  },
  itemLabel: {
    flex: 1,
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.neutral,
  },
  itemStatus: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
  },
  statusOk: {
    color: '#16a34a',
  },
  statusPending: {
    color: Colors.neutral,
    opacity: 0.4,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.neutral,
  },
  okBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  okText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: '#16a34a',
  },
});
