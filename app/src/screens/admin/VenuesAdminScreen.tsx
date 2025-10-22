import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useGetVenuesQuery, useCreateVenueMutation, useUpdateVenueMutation, useDeleteVenueMutation } from '../../services/api';

export default function VenuesAdminScreen() {
  const { data: venues } = useGetVenuesQuery();
  const [form, setForm] = React.useState({ name: '', address: '', latitude: '-34.6037', longitude: '-58.3816' });
  const [edit, setEdit] = React.useState<{ id: number; name: string } | null>(null);

  const [createVenue] = useCreateVenueMutation();
  const [updateVenue] = useUpdateVenueMutation();
  const [deleteVenue] = useDeleteVenueMutation();

  const add = async () => {
    const body = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
    try { await createVenue(body as any).unwrap(); setForm({ name: '', address: '', latitude: '-34.6037', longitude: '-58.3816' }); }
    catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo crear'); }
  };

  const save = async () => {
    if (!edit) return;
    try { await updateVenue({ id: edit.id, name: edit.name } as any).unwrap(); setEdit(null); }
    catch { Alert.alert('Error', 'No se pudo'); }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nueva sede</Text>
      {['name','address','latitude','longitude'].map(k => (
        <TextInput key={k} placeholder={k} value={(form as any)[k]} onChangeText={(t)=>setForm(s=>({ ...s, [k]: t }))} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
      ))}
      <Button title="Agregar" onPress={add} />
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Sedes</Text>
      <FlatList
        data={venues || []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>{item.name} - {item.latitude},{item.longitude}</Text>
            {edit?.id === item.id ? (
              <View>
                <TextInput placeholder="Nuevo nombre" value={edit.name} onChangeText={(t)=>setEdit({ id: item.id, name: t })} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
                <Button title="Guardar" onPress={save} />
                <Button title="Cancelar" onPress={()=>setEdit(null)} />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Renombrar" onPress={()=>setEdit({ id: item.id, name: item.name })} />
                <Button title="Borrar" color="red" onPress={async () => { try { await deleteVenue(item.id).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); } }} />
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}