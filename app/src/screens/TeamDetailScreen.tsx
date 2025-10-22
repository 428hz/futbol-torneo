import React from 'react';
import { View, Text, FlatList } from 'react-native';

export default function TeamDetailScreen({ route }: any) {
  const { team } = route.params;
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{team.name}</Text>
      <Text>Pts: {team.stats.points} | DG: {team.stats.gd}</Text>
      <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '600' }}>Jugadores</Text>
      <FlatList
        data={team.players}
        keyExtractor={(p: any) => String(p.id)}
        renderItem={({ item }) => (
          <Text>- #{item.jerseyNumber} {item.firstName} {item.lastName} ({item.position})</Text>
        )}
      />
    </View>
  );
}
