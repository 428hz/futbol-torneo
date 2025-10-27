import React from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  useGetPlayersQuery,
  useGetTeamsQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation
} from '../../api';
import PromptDialog from '../../components/PromptDialog';

const POSICIONES = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];

export default function PlayersAdminScreen() {
  const { data: players, refetch, isError } = useGetPlayersQuery();
  const { data: teams } = useGetTeamsQuery();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [position, setPosition] = React.useState<string | undefined>(undefined);
  const [jerseyNumber, setJerseyNumber] = React.useState('');
  const [teamId, setTeamId] = React.useState<number | undefined>(undefined);

  const [createPlayer, { isLoading: creating }] = useCreatePlayerMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [deletePlayer] = useDeletePlayerMutation();

  // Modal para editar
  const [editVisible, setEditVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const onCreate = async () => {
    try {
      if (!firstName.trim() || !lastName.trim()) return Alert.alert('Faltan datos', 'Nombre y apellido son obligatorios.');
      if (!position) return Alert.alert('Falta posición', 'Seleccioná una posición.');
      if (!teamId) return Alert.alert('Falta equipo', 'Seleccioná un equipo.');
      await createPlayer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age || 0),
        position,
        jerseyNumber: Number(jerseyNumber || 0),
        teamId: Number(teamId),
      }).unwrap();
      setFirstName(''); setLastName(''); setAge(''); setPosition(undefined); setJerseyNumber(''); setTeamId(undefined);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear');
    }
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setEditVisible(true);
  };

  const submitEdit = async (values: Record<string, string>) => {
    try {
      const nf = (values.firstName ?? '').trim();
      const nl = (values.lastName ?? '').trim();
      const pos = (values.position ?? '').trim();
      const ageStr = (values.age ?? '').trim();
      const numStr = (values.jerseyNumber ?? '').trim();
      const teamStr = (values.teamId ?? '').trim();

      if (!nf || !nl) return Alert.alert('Faltan datos', 'Nombre y apellido son obligatorios.');

      const payload: any = { id: editing.id, firstName: nf, lastName: nl };
      if (pos) payload.position = pos;
      if (ageStr !== '') payload.age = Number(ageStr);
      if (numStr !== '') payload.jerseyNumber = Number(numStr);
      if (teamStr !== '') payload.teamId = Number(teamStr);

      await updatePlayer(payload).unwrap();
      setEditVisible(false);
      setEditing(null);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo actualizar');
    }
  };

  const onDelete = async (id:number) => {
    try { await deletePlayer(id).unwrap(); refetch(); }
    catch (e:any) { Alert.alert('Error', e?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:100 }}>
      {isError ? <Text style={{ color:'#c00', marginBottom: 8 }}>No se pudo cargar la lista. ¿Backend corriendo?</Text> : null}

      <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Nuevo jugador</Text>
      <TextInput placeholder="Nombre" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Apellido" value={lastName} onChangeText={setLastName} style={styles.input} />

      <Text style={styles.label}>Posición</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={position} onValueChange={(v)=>setPosition(v)} style={styles.picker}>
          <Picker.Item label="Seleccioná posición" value={undefined} />
          {POSICIONES.map((p)=> <Picker.Item key={p} label={p} value={p} />)}
        </Picker>
      </View>

      <TextInput placeholder="Edad" keyboardType="numeric" value={age} onChangeText={setAge} style={styles.input} />
      <TextInput placeholder="N° de casaca" keyboardType="numeric" value={jerseyNumber} onChangeText={setJerseyNumber} style={styles.input} />

      <Text style={styles.label}>Equipo</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={teamId}
          onValueChange={(v)=> setTeamId(v === undefined ? undefined : Number(v))}
          style={styles.picker}
        >
          <Picker.Item label="Seleccioná equipo" value={undefined} />
          {(teams||[]).map((t:any)=> <Picker.Item key={t.id} label={t.name} value={t.id} />)}
        </Picker>
      </View>

      <Button title={creating ? 'Agregando...' : 'Agregar'} onPress={onCreate} />

      <Text style={{ fontWeight:'bold', fontSize:18, marginVertical:12 }}>Jugadores</Text>
      {(players||[]).map((item:any)=>(
        <View key={item.id} style={{ paddingVertical:8, borderBottomWidth:1, borderColor:'#eee' }}>
          <Text>#{item.id} {item.firstName} {item.lastName} ({item.position}) - {item.team?.name}</Text>
          <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
            <Button title="Editar" onPress={()=>openEdit(item)} />
            <Button title="Borrar" color="#c00" onPress={()=>onDelete(item.id)} />
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />

      <PromptDialog
        visible={editVisible}
        title="Editar jugador"
        fields={[
          { key: 'firstName', label: 'Nombre' },
          { key: 'lastName', label: 'Apellido' },
          { key: 'position', label: 'Posición (Arquero/Defensor/Mediocampista/Delantero)' },
          { key: 'age', label: 'Edad', keyboardType: 'numeric' },
          { key: 'jerseyNumber', label: 'N° de casaca', keyboardType: 'numeric' },
          { key: 'teamId', label: 'Team ID', keyboardType: 'numeric' },
        ]}
        initialValues={{
          firstName: editing?.firstName,
          lastName: editing?.lastName,
          position: editing?.position,
          age: editing?.age?.toString?.() ?? '',
          jerseyNumber: editing?.jerseyNumber?.toString?.() ?? '',
          teamId: editing?.teamId?.toString?.() ?? '',
        }}
        onCancel={() => { setEditVisible(false); setEditing(null); }}
        onSubmit={submitEdit}
        confirmText="Guardar"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, paddingHorizontal:10, height:40, marginBottom:6 },
  label: { marginTop: 6, marginBottom: 4, color:'#333' },
  pickerBox: { borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:6 },
  picker: { height: 36 },
});