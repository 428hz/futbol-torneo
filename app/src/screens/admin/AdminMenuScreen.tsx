import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from './index';
import { clearToken } from '../../services/api';

export default function AdminMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [me, setMe] = React.useState<{ name?: string; role?: string } | null>(null);

  React.useEffect(() => {
    try {
      const s = localStorage.getItem('user');
      setMe(s ? JSON.parse(s) : null);
    } catch { setMe(null); }
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={onLogout} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Salir</Text>
        </Pressable>
      ),
      title: 'Admin',
    });
  }, [navigation]);

  const Item = ({ title, to }: { title: string; to: keyof AdminStackParamList }) => (
    <Pressable style={styles.item} onPress={() => navigation.navigate(to)}>
      <Text style={styles.itemText}>{title}</Text>
    </Pressable>
  );

  const onLogout = () => {
    clearToken();
    try { localStorage.removeItem('user'); } catch {}
    try { Alert.alert('Sesión cerrada', 'Volvé a ingresar para administrar.'); } catch {}
    navigation.getParent()?.navigate('Inicio' as never);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Admin</Text>
      {me?.name ? <Text style={{ marginBottom: 8 }}>Hola, {me.name} {me.role ? `(${me.role})` : ''}</Text> : null}

      <Item title="EQUIPOS (ABM)" to="AdminTeams" />
      <Item title="JUGADORES (ABM)" to="AdminPlayers" />
      <Item title="PARTIDOS (ABM)" to="AdminMatches" />
      <Item title="USUARIOS (ABM)" to="AdminUsers" />
      <Item title="ESTADÍSTICAS" to="AdminStats" />
      <Item title="MAPA DE SEDES" to="AdminVenuesMap" />
      <Item title="NOTIFICACIONES" to="AdminNotifications" />
      <Item title="SUBIR FOTO DE JUGADOR" to="AdminPlayerPhoto" />

      <Pressable style={[styles.item, styles.logout]} onPress={onLogout}>
        <Text style={[styles.itemText, { color: '#fff' }]}>CERRAR SESIÓN</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  item: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemText: { color: '#fff', fontWeight: 'bold' },
  logout: { backgroundColor: '#d9534f', marginTop: 12 },
});