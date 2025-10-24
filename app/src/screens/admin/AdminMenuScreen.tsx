import React from 'react';
import { View, Button } from 'react-native';

export default function AdminMenuScreen({ navigation }: any) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Button title="Equipos (ABM)" onPress={() => navigation.navigate('AdminTeams')} />
      <Button title="Jugadores (ABM)" onPress={() => navigation.navigate('AdminPlayers')} />
      <Button title="Partidos (ABM)" onPress={() => navigation.navigate('AdminMatches')} />
      <Button title="Usuarios (ABM)" onPress={() => navigation.navigate('AdminUsers')} />
    </View>
  );
}