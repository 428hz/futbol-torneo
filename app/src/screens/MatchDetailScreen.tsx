import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useGetMatchEventsQuery } from '../api';

export default function MatchDetailScreen() {
  const route = useRoute<any>();
  const matchId = Number(route.params?.id);
  const { data: events, isFetching } = useGetMatchEventsQuery(matchId);

  const group = (type: 'goal'|'yellow'|'red') => (events||[]).filter(e => e.type === type);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={{ fontWeight:'bold', fontSize: 18, marginBottom: 8 }}>Eventos del partido #{matchId}</Text>
      {isFetching ? <Text>Cargando...</Text> : null}

      <Text style={{ fontWeight:'bold', marginTop:12 }}>Goles</Text>
      {group('goal').length ? group('goal').map(e => (
        <Text key={e.id}>Min {e.minute}: {e.team?.name} {e.player ? `- ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
      )) : <Text style={{ color:'#666' }}>Sin goles</Text>}

      <Text style={{ fontWeight:'bold', marginTop:12 }}>Tarjetas amarillas</Text>
      {group('yellow').length ? group('yellow').map(e => (
        <Text key={e.id}>Min {e.minute}: {e.team?.name} {e.player ? `- ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
      )) : <Text style={{ color:'#666' }}>Sin amarillas</Text>}

      <Text style={{ fontWeight:'bold', marginTop:12 }}>Tarjetas rojas</Text>
      {group('red').length ? group('red').map(e => (
        <Text key={e.id}>Min {e.minute}: {e.team?.name} {e.player ? `- ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
      )) : <Text style={{ color:'#666' }}>Sin rojas</Text>}
    </ScrollView>
  );
}