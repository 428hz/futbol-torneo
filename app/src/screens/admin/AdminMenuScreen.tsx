import React from 'react';
import { View, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from './index';

export default function AdminMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
      <View>
        <Button title="EQUIPOS (ABM)" onPress={() => navigation.navigate('AdminTeams')} />
      </View>
      <View>
        <Button title="JUGADORES (ABM)" onPress={() => navigation.navigate('AdminPlayers')} />
      </View>
      <View>
        <Button title="PARTIDOS (ABM)" onPress={() => navigation.navigate('AdminMatches')} />
      </View>
      <View>
        <Button title="USUARIOS (ABM)" onPress={() => navigation.navigate('AdminUsers')} />
      </View>

      {/* Nuevos accesos dentro del mismo stack de Admin */}
      <View>
        <Button title="ESTADÍSTICAS" onPress={() => navigation.navigate('AdminStats')} />
      </View>
      <View>
        <Button title="MAPA DE SEDES" onPress={() => navigation.navigate('AdminVenuesMap')} />
      </View>
      <View>
        <Button title="NOTIFICACIONES" onPress={() => navigation.navigate('AdminNotifications')} />
      </View>
    </ScrollView>
  );
}