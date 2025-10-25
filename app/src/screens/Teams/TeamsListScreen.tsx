import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetTeamsQuery } from '../../api';

export default function TeamsListScreen() {
  const { data, isLoading, isError, refetch } = useGetTeamsQuery();

  if (isLoading) return <View style={s.center}><ActivityIndicator /></View>;
  if (isError) return (
    <View style={s.center}>
      <Text style={{ color: '#c00' }}>No se pudieron cargar los equipos.</Text>
      <Text onPress={refetch} style={{ color:'#1677ff', marginTop: 6 }}>Reintentar</Text>
    </View>
  );

  return (
    <FlatList
      data={data || []}
      keyExtractor={(t:any)=>String(t.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      renderItem={({ item }: any) => (
        <View style={s.row}>
          {item.crestUrl ? (
            <Image source={{ uri: item.crestUrl }} style={s.logo} />
          ) : <View style={[s.logo, s.logoPlaceholder]} />}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color:'#666', textAlign:'center', marginTop: 20 }}>No hay equipos</Text>}
    />
  );
}

const s = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center' },
  row: { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' },
  logo: { width:32, height:32, borderRadius:6 },
  logoPlaceholder: { backgroundColor:'#eee' },
  name: { fontSize:16 },
});