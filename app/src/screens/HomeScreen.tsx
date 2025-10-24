import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useGetUpcomingMatchesQuery } from '../services/api';

export default function HomeScreen() {
  const { data, refetch, isFetching } = useGetUpcomingMatchesQuery();
  const upcoming = data || [];

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700', marginBottom:8 }}>Próximos partidos</Text>
      <View style={{ marginBottom:8 }}>
        <Button title={isFetching ? 'Actualizando...' : 'Refrescar'} onPress={()=>refetch()} />
      </View>

      {upcoming.length === 0 ? (
        <Text style={{ color:'#666' }}>
          No hay partidos próximos. Creá uno desde Admin → Partidos con fecha a futuro (por ej. hoy + 2 hs).
        </Text>
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(m)=>String(m.id)}
          renderItem={({ item }) => (
            <View style={{ padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8 }}>
              <Text style={{ fontWeight:'600' }}>{item.homeTeam.name} vs {item.awayTeam.name}</Text>
              <Text>{new Date(item.datetime).toLocaleString()} · {item.venue?.name}</Text>
              <Text style={{ color:'#666' }}>Estado: {item.status}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}