import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NotAllowedScreen() {
  const navigation = useNavigation<any>();

  const changeAccount = () => {
    try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch {}
    try { window.dispatchEvent(new Event('auth-changed')); } catch {}
    Alert.alert?.('Sesión cerrada', 'Elegí otra cuenta para ingresar.');
    // Volver al login embebido: navegando a Admin causará que muestre LoginScreen
    navigation.getParent()?.navigate('Admin');
  };

  const goHome = () => {
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Acceso solo administradores</Text>
      <Text style={{ marginBottom: 16 }}>
        Esta sección requiere permisos de administrador.
      </Text>

      <Pressable style={[styles.btn, styles.secondary]} onPress={changeAccount}>
        <Text style={styles.btnText}>Cambiar de cuenta (volver al login)</Text>
      </Pressable>

      <View style={{ height: 10 }} />

      <Pressable style={[styles.btn, styles.primary]} onPress={goHome}>
        <Text style={styles.btnText}>Volver al inicio</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  box: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center' },
  primary: { backgroundColor: '#1e90ff' },
  secondary: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});