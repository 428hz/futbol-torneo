import React from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView, TextInput, StyleSheet, Platform, Modal } from 'react-native';
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
  useDeleteMatchMutation,
  useDeleteMatchesBulkMutation,
  useGetMatchEventsQuery,
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

const reDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // AAAA-MM-DD
const reTime = /^([01]\d|2[0-3]):([0-5]\d)$/;                   // HH:MM (00–23/00–59)
function isValidDate(s: string) { if (!reDate.test(s)) return false; const d = new Date(s+'T00:00:00Z'); return !isNaN(d.getTime()); }
function isValidTime(s: string) { return reTime.test(s); }

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
  const [deleteMatch] = useDeleteMatchMutation();
  const [deleteBulk, { isLoading: deletingBulk }] = useDeleteMatchesBulkMutation();
  const [deleteBeforeDate, setDeleteBeforeDate] = React.useState('');

  // Modales
  const [eventVisible, setEventVisible] = React.useState(false);
  const [eventMatch, setEventMatch] = React.useState<any | null>(null);
  const [eventsVisible, setEventsVisible] = React.useState(false);

  useFocusEffect(React.useCallback(() => { refetchVenues(); refetchTeams(); refetch(); }, [refetchVenues, refetchTeams, refetch]));

  const onCreate = async () => {
    try {
      if (!homeTeamId || !awayTeamId || !venueId) return Alert.alert('Faltan datos', 'Seleccioná equipo local, visitante y sede.');
      if (homeTeamId === awayTeamId) return Alert.alert('Equipos inválidos', 'El local y el visitante no pueden ser el mismo equipo.');
      if (!isValidDate(dateStr)) return Alert.alert('Fecha inválida', 'Formato AAAA-MM-DD y fecha válida.');
      if (!isValidTime(timeStr)) return Alert.alert('Hora inválida', 'Formato HH:MM y hora válida (00–23/00–59).');

      const datetime = joinISO(dateStr, timeStr);
      const payload = { homeTeamId, awayTeamId, venueId, datetime };
      await createMatch(payload).unwrap();
      setHomeTeamId(undefined); setAwayTeamId(undefined); setVenueId(undefined);
      const def = splitISO(isoInHours(2)); setDateStr(def.date); setTimeStr(def.time);
      refetch();
    } catch (e: any) {
      console.error('[Crear partido] error:', e);
      Alert.alert('Error', e?.data?.error || 'No se pudo crear el partido');
    }
  };

  const onFinish = async (id: number) => {
    try { await finishMatch(id).unwrap(); refetch(); }
    catch (e: any) { console.error('[Finalizar partido] error:', e); Alert.alert('Error', e?.data?.error || 'No se pudo finalizar'); }
  };

  const seedVenues = async () => {
    try {
      const demos = [
        { name: 'Estadio Central', address: 'Av. Siempre Viva 123', latitude: -34.6037, longitude: -58.3816 },
        { name: 'Cancha Norte', address: 'Av. del Deporte 456', latitude: -34.6, longitude: -58.4 },
      ];
      for (const v of demos) await createVenue(v).unwrap();
      await refetchVenues(); Alert.alert('Listo', 'Se crearon sedes de ejemplo');
    } catch (e:any) { console.error('[Seed sedes] error:', e); Alert.alert('Error', e?.data?.error || 'No se pudieron crear las sedes'); }
  };

  const crearHabilitado =
    !!homeTeamId && !!awayTeamId && !!venueId &&
    homeTeamId !== awayTeamId &&
    isValidDate(dateStr) && isValidTime(timeStr);

  const openEvents = (m: any) => { setEventMatch(m); setEventsVisible(true); };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
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
      {homeTeamId && awayTeamId && homeTeamId === awayTeamId ? (
        <Text style={{ color:'#c00', marginBottom: 6 }}>El local y el visitante no pueden ser el mismo equipo.</Text>
      ) : null}

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Sede</Text>
        <View style={{ flexDirection:'row', gap: 8, flexWrap:'wrap' }}>
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
      <View style={{ flexDirection:'row', gap: 8, flexWrap:'wrap' }}>
        {Platform.OS === 'web' ? (
          <>
            {/* @ts-ignore: elemento HTML nativo en RN Web */}
            <input type="date" value={dateStr} onChange={(e:any)=> setDateStr(e.target.value)} style={styles.htmlInput as any} />
            {/* @ts-ignore */}
            <input type="time" value={timeStr} onChange={(e:any)=> setTimeStr(e.target.value)} style={styles.htmlInput as any} />
          </>
        ) : (
          <>
            <TextInput placeholder="AAAA-MM-DD" value={dateStr} onChangeText={setDateStr} style={[styles.input, { flex: 1, minWidth: 160 }]} inputMode="numeric" />
            <TextInput placeholder="HH:MM" value={timeStr} onChangeText={setTimeStr} style={[styles.input, { width: 110 }]} inputMode="numeric" />
          </>
        )}
      </View>
      {(!isValidDate(dateStr) || !isValidTime(timeStr)) ? <Text style={{ color:'#c00', marginTop: 4 }}>Ingresá fecha y hora válidas.</Text> : null}

      <View style={{ marginTop: 8 }}>
        <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} disabled={!crearHabilitado || creating} />
      </View>

      <Text style={styles.listTitle}>Listado</Text>
      <FlatList
        data={matches || []}
        keyExtractor={(m)=>String(m.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>#{item.id} {item.homeTeam.name} {item.homeScore ?? 0} - {item.awayScore ?? 0} {item.awayTeam.name}</Text>
            <Text>{new Date(item.datetime).toLocaleString()} · {item.venue?.name} · {item.status}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:6, flexWrap:'wrap' }}>
              <Button title="Ver eventos" onPress={()=> openEvents(item)} />
              <Button title="Anotar" onPress={()=>{ setEventMatch(item); setEventVisible(true); }} />
              {item.status !== 'finished'
                ? <Button title="Finalizar" onPress={()=>onFinish(item.id)} />
                : <Button title="Eliminar" color="#c00" onPress={async()=>{ try { await deleteMatch(item.id).unwrap(); refetch(); } catch(e:any){ Alert.alert('Error', e?.data?.error || 'No se pudo eliminar'); } }} />
              }
            </View>
          </View>
        )}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color:'#666' }}>{isFetching ? 'Cargando...' : 'No hay partidos'}</Text>}
      />

      {/* Borrado masivo al final de la pantalla */}
      <View style={{ marginTop: 16, gap: 8 }}>
        <Button
          title={deletingBulk ? 'Borrando finalizados...' : 'Borrar partidos finalizados'}
          onPress={async ()=>{ try { const r = await deleteBulk({ status: 'finished' }).unwrap(); Alert.alert('Listo', `Se borraron ${r.deleted} partidos finalizados`); refetch(); } catch(e:any){ Alert.alert('Error', e?.data?.error || 'No se pudo borrar'); } }}
        />
        <View style={{ flexDirection:'row', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <input type="date" value={deleteBeforeDate} onChange={(e:any)=> setDeleteBeforeDate(e.target.value)} style={styles.htmlInput as any} />
          ) : (
            <TextInput placeholder="AAAA-MM-DD" value={deleteBeforeDate} onChangeText={setDeleteBeforeDate} style={[styles.input, { flex: 1, minWidth: 160 }]} />
          )}
          <Button
            title={deletingBulk ? 'Borrando...' : 'Borrar anteriores a fecha'}
            onPress={async ()=>{ try { const r = await deleteBulk({ before: `${deleteBeforeDate}T00:00:00.000Z` }).unwrap(); Alert.alert('Listo', `Se borraron ${r.deleted} partidos`); refetch(); } catch(e:any){ Alert.alert('Error', e?.data?.error || 'No se pudo borrar'); } }}
          />
        </View>
      </View>

      {/* Dialogo para crear evento */}
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
              console.error('[Crear evento] error:', e);
              Alert.alert('Error', e?.data?.error || 'No se pudo anotar el evento');
            }
          }}
          homeTeam={eventMatch.homeTeam}
          awayTeam={eventMatch.awayTeam}
          players={(players||[]).map((p:any)=>({ id:p.id, firstName:p.firstName, lastName:p.lastName, teamId:p.teamId }))}
        />
      )}

      {/* Modal "Ver eventos" */}
      {eventsVisible && eventMatch ? (
        <EventsModal matchId={eventMatch.id} onClose={()=> { setEventsVisible(false); setEventMatch(null); }} />
      ) : null}
    </ScrollView>
  );
}

function EventsModal({ matchId, onClose }: { matchId: number; onClose: ()=>void }) {
  const { data: events, isFetching } = useGetMatchEventsQuery(matchId);
  const group = (type: 'goal'|'yellow'|'red') => (events || []).filter((e:any)=> e.type === type);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', padding:16 }}>
        <View style={{ backgroundColor:'#fff', borderRadius:12, padding:16, maxHeight:'80%' }}>
          <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Eventos del partido #{matchId}</Text>
          {isFetching ? <Text>Cargando…</Text> : null}

          <Text style={{ fontWeight:'bold', marginTop:8 }}>Goles</Text>
          {group('goal').length ? group('goal').map((e:any)=>(
            <Text key={e.id}>Min {e.minute}: {e.team?.name}{e.player ? ` - ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
          )) : <Text style={{ color:'#666' }}>Sin goles</Text>}

          <Text style={{ fontWeight:'bold', marginTop:8 }}>Tarjetas amarillas</Text>
          {group('yellow').length ? group('yellow').map((e:any)=>(
            <Text key={e.id}>Min {e.minute}: {e.team?.name}{e.player ? ` - ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
          )) : <Text style={{ color:'#666' }}>Sin amarillas</Text>}

          <Text style={{ fontWeight:'bold', marginTop:8 }}>Tarjetas rojas</Text>
          {group('red').length ? group('red').map((e:any)=>(
            <Text key={e.id}>Min {e.minute}: {e.team?.name}{e.player ? ` - ${e.player.firstName} ${e.player.lastName}` : ''}</Text>
          )) : <Text style={{ color:'#666' }}>Sin rojas</Text>}

          <View style={{ marginTop:12, alignItems:'flex-end' }}>
            <Button title="Cerrar" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight:'bold', fontSize:18, marginBottom:8 },
  listTitle: { fontWeight:'bold', fontSize:18, marginVertical:12 },
  label: { marginTop: 6, marginBottom: 4, color:'#333' },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, paddingHorizontal:10, height:40 },
  htmlInput: { borderWidth:1, borderColor:'#ccc', borderRadius:6, paddingLeft:10, height:40, minWidth:160 },
  pickerBox: { borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:6 },
  picker: { height: 36 },
  item: { paddingVertical:8, borderBottomWidth:1, borderColor:'#eee' },
  rowBetween: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
});