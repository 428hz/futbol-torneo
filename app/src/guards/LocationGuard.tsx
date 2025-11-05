import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

type Props = {
  children: ReactNode;
  // UI opcional cuando el usuario niega el permiso
  fallback?: ReactNode;
  // Mensajes personalizables
  messages?: {
    loading?: string;
    denied?: string;
    openSettings?: string;
  };
};

export default function LocationGuard({ children, fallback, messages }: Props) {
  const [state, setState] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) Primero leemos el permiso existente (evita dobles prompts)
        const cur = await Location.getForegroundPermissionsAsync();
        if (cur.status === 'granted') {
          if (mounted) setState('granted');
          return;
        }
        // 2) Si se puede volver a pedir, lo pedimos
        if (cur.canAskAgain) {
          const req = await Location.requestForegroundPermissionsAsync();
          if (mounted) setState(req.status === 'granted' ? 'granted' : 'denied');
          return;
        }
        // 3) No se puede volver a pedir → denegado
        if (mounted) setState('denied');
      } catch {
        if (mounted) setState('denied');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (state === 'checking') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.msg}>{messages?.loading ?? 'Verificando permisos de ubicación…'}</Text>
      </View>
    );
  }

  if (state === 'denied') {
    if (fallback) return <>{fallback}</>;
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>
          {messages?.denied ?? 'Necesitamos el permiso de ubicación para mostrar el mapa correctamente.'}
        </Text>
        <Text style={[styles.link]} onPress={() => Linking.openSettings()}>
          {messages?.openSettings ?? (Platform.OS === 'ios' ? 'Abrir Configuración' : 'Abrir Ajustes')}
        </Text>
      </View>
    );
  }

  // granted
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  msg: { marginTop: 12, textAlign: 'center' },
  link: { color: '#1e88e5', marginTop: 12, textDecorationLine: 'underline' },
});