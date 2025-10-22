import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useGetFixtureQuery, useGetTeamsQuery, useGetVenuesQuery, useCreateMatchMutation, useAddMatchEventMutation, useFinishMatchMutation } from '../../services/api';

export default function MatchesAdminScreen() {
  const { data: matches } = useGetFixtureQuery();
  const { data: teams } = useGetTeamsQuery();
  const { data: venues } = useGetVenuesQuery();
  const [form, setForm] = React.useState({ homeTeamId: '', awayTeamId: '', venueId: '', datetime: new Date(Date.now()+3600e3).toISOString() });
  const [createMatch] = useCreateMatchMutation();
  const [addEvent] = useAddMatchEventMutation();
  const [finishMatch] = useFinishMatchMutation();

  const add = async () => {
    const body = {
      homeTeamId: Number(form.homeTeamId),
      awayTeamId: Number(form.awayTeamId),
      venueId: Number(form.venueId),
      datetime: form.datetime
    };
    try { await createMatch(body).unwrap(); setForm({ homeTeamId:'', awayTeamId:'', venueId:'', datetime:new Date(Date.now()+3600e3).toISOString() }); }
    catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo crear'); }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nuevo partido</Text>
      {['homeTeamId','awayTeamId','venueId','datetime'].map(k => (
        <TextInput key={k} placeholder={k} value={(form as any)[k]} onChangeText={(t)=>setForm(s=>({ ...s, [k]: t }))} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
      ))}
      <Text>Equipos: {teams?.map(t=>`${t.id}:${t.name}`).join(' | ')}</Text>
      <Text>Sedes: {venues?.map(v=>`${v.id}:${v.name}`).join(' | ')}</Text>
      <Button title="Agregar" onPress={add} />

      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Partidos</Text>
      <FlatList
        data={matches || []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>#{item.id} {item.homeTeam.name} vs {item.awayTeam.name} - {new Date(item.datetime).toLocaleString()} - {item.status} ({item.homeScore}-{item.awayScore})</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <Button title="Gol local" onPress={async () => { try { await addEvent({ id: item.id, teamId: item.homeTeamId, minute: 1, type: 'goal' }).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); } }} />
              <Button title="Gol visita" onPress={async () => { try { await addEvent({ id: item.id, teamId: item.awayTeamId, minute: 1, type: 'goal' }).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); } }} />
              <Button title="Finalizar" onPress={async () => { try { await finishMatch(item.id).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); } }} />
            </View>
          </View>
        )}
      />
    </View>
  );
}