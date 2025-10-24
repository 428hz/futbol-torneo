import React from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import {
  useGetFixtureQuery,
  useGetTeamsQuery,
  useGetVenuesQuery,
  useGetPlayersQuery,
  useCreateMatchMutation,
  useFinishMatchMutation,
  useCreateVenueMutation,
  useCreateMatchEventMutation,
} from '../../api';
import AddMatchEventDialog from '../../components/AddMatchEventDialog';

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function splitISO(iso: string) {
  const d = new Date(iso);
  return { date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}
function joinISO(dateStr: string, timeStr: string) {
  const [y,m,d] = dateStr.split('-').map(Number);
  const [hh,mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0, 0);
  return dt.toISOString();
}
function isoInHours(hours: number) { const d = new Date(); d.setHours(d.getHours() + hours); return d.toISOString(); }

export default function MatchesAdminScreen() {
  const { data: matches, refetch, isFetching } = useGetFixtureQuery();
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: venues, refetch: refetchVenues, isFetching: fetchingVenues } = useGetVenuesQuery();
  const { data: players } = useGetPlayersQuery();

  const [homeTeamId, setHomeTeamId] = React.useState<number | undefined>();
  const [awayTeamId, setAwayTeamId] = React.useState<number | undefined>();
  const [venueId, setVenueId] = React.useState<number | undefined>();
  const [dateStr, setDateStr] = React.useState(splitISO(isoInHours(2)).date);
  const [timeStr, setTimeStr] = React.useState(splitISO(isoInHours(2)).time);

  const [createMatch, { isLoading: creating }] = useCreateMatchMutation();
  const [finishMatch] = useFinishMatchMutation();
  const [createVenue, { isLoading: creatingVenue }] = useCreateVenueMutation();
  const [createEvent] = useCreateMatchEventMutation();

  // Modal de evento
  const [eventVisible, setEventVisible] = React.useState(false);
  const [eventMatch, setEventMatch] = React.useState<any | null>(null);

  useFocusEffect(React.useCallback(() => { refetchVenues(); refetchTeams(); refetch(); }, [refetchVenues, refetchTeams, refetch]));

  const onCreate = async () => {
    try {
      if (!homeTeamId || !awayTeamId || !venueId) return Alert.alert('Faltan datos', 'Seleccioná equipo local, visitante y sede.');
      const datetime = joinISO(dateStr, timeStr);
      await createMatch({ homeTeamId, awayTeamId, venueId, datetime }).unwrap();
      setHomeTeamId(undefined); setAwayTeamId(undefined); setVenueId(undefined);
      const def = splitISO(isoInHours(2)); setDateStr(def.date); setTimeStr(def.time);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear el partido');
    }
  };

  const onFinish = async (id: number) => {
    try { await finishMatch(id).unwrap(); refetch(); }
    catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo finalizar'); }
  };

  const seedVenues = async () => {
    try {
      const demos = [
        { name: 'Estadio Central', address: 'Av. Siempre Viva 123', latitude: -34.6037, longitude: -58.3816 },
        { name: 'Cancha Norte', address: 'Av. del Deporte 456', latitude: -34.6, longitude: -58.4 },
      ];
      for (const v of demos) await createVenue(v).unwrap();
      await refetchVenues(); Alert.alert('Listo', 'Se crearon sedes de ejemplo');
    } catch (e:any) { Alert.alert('Error', e?.data?.error || 'No se pudieron crear las sedes'); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Text style={styles.title}>Crear partido</Text>

      <Text style={styles.label}>Equipo local</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={homeTeamId} onValueChange={(v)=> setHomeTeamId(v === undefined ? undefined : Number(v))} style={styles.picker}>
          <Picker.Item label="Seleccioná equipo" value={undefined} />
          {(teams||[]).map((t:any)=> <Picker.Item key={t.id} label={t.name} value={t.id} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Equipo visitante</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={awayTeamId} onValueChange={(v)=> setAwayTeamId(v === undefined ? undefined : Number(v))} style={styles.picker}>
          <Picker.Item label="Seleccioná equipo" value={undefined} />
          {(teams||[]).map((t:any)=> <Picker.Item key={t.id} label={t.name} value={t.id} />)}
        </Picker>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Sede</Text>
        <View style={{ flexDirection:'row', gap: 8 }}>
          <Button title={fetchingVenues ? 'Refrescando...' : 'Refrescar sedes'} onPress={()=>refetchVenues()} />
          <Button title={creatingVenue ? 'Creando sedes...' : 'Crear sedes demo'} onPress={seedVenues} />
        </View>
      </View>
      <View style={styles.pickerBox}>
        <Picker selectedValue={venueId} onValueChange={(v)=> setVenueId(v === undefined ? undefined : Number(v))} style={styles.picker}>
          <Picker.Item label="Seleccioná sede" value={undefined} />
          {(venues||[]).map((v:any)=> <Picker.Item key={v.id} label={v.name} value={v.id} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Fecha y hora</Text>
      <View style={{ flexDirection:'row', gap: 8 }}>
        <TextInput placeholder="AAAA-MM-DD" value={dateStr} onChangeText={setDateStr} style={[styles.input, { flex: 1 }]} />
        <TextInput placeholder="HH:MM" value={timeStr} onChangeText={setTimeStr} style={[styles.input, { width: 110 }]} />
      </View>

      <View style={{ marginTop: 8 }}>
        <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} />
      </View>

      <Text style={styles.listTitle}>Listado</Text>
      <FlatList
        data={matches || []}
        keyExtractor={(m)=>String(m.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>#{item.id} {item.homeTeam.name} {item.homeScore ?? 0} - {item.awayScore ?? 0} {item.awayTeam.name}</Text>
            <Text>{new Date(item.datetime).toLocaleString()} · {item.venue?.name} · {item.status}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
              <Button title="Anotar" onPress={()=>{ setEventMatch(item); setEventVisible(true); }} />
              {item.status !== 'finished' ? <Button title="Finalizar" onPress={()=>onFinish(item.id)} /> : null}
            </View>
          </View>
        )}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color:'#666' }}>{isFetching ? 'Cargando...' : 'No hay partidos'}</Text>}
      />

      {eventMatch && (
        <AddMatchEventDialog
          visible={eventVisible}
          onClose={()=>{ setEventVisible(false); setEventMatch(null); }}
          onSubmit={async (data) => {
            try {
              await createEvent({ matchId: eventMatch.id, ...data }).unwrap();
              setEventVisible(false); setEventMatch(null);
              refetch();
            } catch (e:any) {
              Alert.alert('Error', e?.data?.error || 'No se pudo anotar el evento');
            }
          }}
          homeTeam={eventMatch.homeTeam}
          awayTeam={eventMatch.awayTeam}
          players={(players||[]).map((p:any)=>({ id:p.id, firstName:p.firstName, lastName:p.lastName, teamId:p.teamId }))}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight:'bold', fontSize:18, marginBottom:8 },
  listTitle: { fontWeight:'bold', fontSize:18, marginVertical:12 },
  label: { marginTop: 6, marginBottom: 4, color:'#333' },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, paddingHorizontal:10, height:40 },
  pickerBox: { borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:6 },
  picker: { height: 36 },
  item: { paddingVertical:8, borderBottomWidth:1, borderColor:'#eee' },
  rowBetween: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
});