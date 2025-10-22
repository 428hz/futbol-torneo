import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useGetPlayersQuery, useCreatePlayerMutation, useUpdatePlayerMutation, useDeletePlayerMutation } from '../../services/api';

export default function PlayersAdminScreen() {
  const { data: players } = useGetPlayersQuery();
  const [form, setForm] = React.useState({ firstName: '', lastName: '', age: '20', position: 'Delantero', jerseyNumber: '9', teamId: '' });
  const [edit, setEdit] = React.useState<{ id: number; position: string } | null>(null);

  const [createPlayer] = useCreatePlayerMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [deletePlayer] = useDeletePlayerMutation();

  const add = async () => {
    const body = { ...form, age: Number(form.age), jerseyNumber: Number(form.jerseyNumber), teamId: Number(form.teamId) };
    try { await createPlayer(body as any).unwrap(); setForm({ firstName: '', lastName: '', age: '20', position: 'Delantero', jerseyNumber: '9', teamId: '' }); }
    catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo crear'); }
  };

  const save = async () => {
    if (!edit) return;
    try { await updatePlayer({ id: edit.id, position: edit.position } as any).unwrap(); setEdit(null); }
    catch { Alert.alert('Error', 'No se pudo'); }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nuevo jugador</Text>
      {['firstName','lastName','position','age','jerseyNumber','teamId'].map((k) => (
        <TextInput key={k} placeholder={k} value={(form as any)[k]} onChangeText={(t)=>setForm(s=>({ ...s, [k]: t }))} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
      ))}
      <Button title="Agregar" onPress={add} />
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Jugadores</Text>
      <FlatList
        data={players || []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>#{item.jerseyNumber} {item.firstName} {item.lastName} ({item.position}) - {item.team?.name}</Text>
            {edit?.id === item.id ? (
              <View>
                <TextInput placeholder="Nueva posición" value={edit.position} onChangeText={(t)=>setEdit({ id: item.id, position: t })} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
                <Button title="Guardar" onPress={save} />
                <Button title="Cancelar" onPress={()=>setEdit(null)} />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Editar pos." onPress={()=>setEdit({ id: item.id, position: item.position })} />
                <Button title="Borrar" color="red" onPress={async () => { try { await deletePlayer(item.id).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); } }} />
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}