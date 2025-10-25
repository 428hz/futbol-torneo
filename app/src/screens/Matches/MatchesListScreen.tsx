import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetFixtureQuery } from '../../api';

export default function MatchesListScreen() {
  const { data, isLoading, isError, refetch } = useGetFixtureQuery();

  if (isLoading) return <View style={s.center}><ActivityIndicator /></View>;
  if (isError) return (
    <View style={s.center}>
      <Text style={{ color: '#c00' }}>No se pudo cargar el fixture.</Text>
      <Text onPress={refetch} style={{ color:'#1677ff', marginTop: 6 }}>Reintentar</Text>
    </View>
  );

  return (
    <FlatList
      data={data || []}
      keyExtractor={(m:any)=>String(m.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      renderItem={({ item }: any) => (
        <View style={s.item}>
          <Text style={s.title}>
            {item.homeTeam?.name} {item.homeScore ?? 0} - {item.awayScore ?? 0} {item.awayTeam?.name}
          </Text>
          <Text style={s.sub}>
            {new Date(item.datetime).toLocaleString()} · {item.venue?.name} · {item.status}
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color:'#666', textAlign:'center', marginTop: 20 }}>No hay partidos</Text>}
    />
  );
}

const s = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center' },
  item: { paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' },
  title: { fontSize:16, fontWeight:'600' },
  sub: { color:'#666', marginTop:2 },
});