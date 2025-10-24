import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import {
  useGetTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from '../../api'; // <— CAMBIO: antes era ../../services/api
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptDialog from '../../components/PromptDialog';

export default function TeamsAdminScreen() {
  const { data, refetch, isFetching } = useGetTeamsQuery();
  const [name, setName] = React.useState('');
  const [crestUrl, setCrestUrl] = React.useState('');

  const [createTeam, { isLoading: creating }] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<{ id: number; name: string } | null>(null);

  const [editVisible, setEditVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const onCreate = async () => {
    try {
      if (!name.trim()) return Alert.alert('Falta nombre', 'Ingresá un nombre de equipo.');
      await createTeam({ name: name.trim(), crestUrl: crestUrl.trim() || undefined }).unwrap();
      setName(''); setCrestUrl(''); refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear');
    }
  };

  const openEdit = (team: any) => { setEditing(team); setEditVisible(true); };
  const submitEdit = async (values: Record<string, string>) => {
    try {
      const newName = (values.name ?? '').trim();
      const newCrest = (values.crestUrl ?? '').trim();
      if (!newName) return Alert.alert('Falta nombre', 'Ingresá un nombre de equipo.');
      await updateTeam({ id: editing.id, name: newName, crestUrl: newCrest || undefined }).unwrap();
      setEditVisible(false); setEditing(null); refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo actualizar');
    }
  };

  const askDelete = (team: any) => { setPendingDelete({ id: team.id, name: team.name }); setConfirmVisible(true); };
  const doDelete = async () => {
    if (!pendingDelete) return;
    try { await deleteTeam(pendingDelete.id).unwrap(); setConfirmVisible(false); setPendingDelete(null); refetch(); }
    catch (e:any) { setConfirmVisible(false); Alert.alert('Error', e?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Nuevo equipo</Text>
      <TextInput placeholder="Nombre del equipo" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Escudo (URL, opcional)" value={crestUrl} onChangeText={setCrestUrl} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <Text style={{ color: '#666', marginBottom: 8 }}>Pegá una URL de imagen (https://.../logo.png). Luego agregamos “Subir imagen”.</Text>
      <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} />

      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 12 }}>Listado</Text>
      <FlatList
        refreshing={isFetching}
        onRefresh={refetch}
        data={data || []}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text>{item.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button title="Editar" onPress={() => openEdit(item)} />
              <Button title="Eliminar" color="#c00" onPress={() => askDelete(item)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar equipo"
        message={`¿Eliminar "${pendingDelete?.name}"? También impacta partidos y jugadores.`}
        onConfirm={doDelete}
        onCancel={() => { setConfirmVisible(false); setPendingDelete(null); }}
      />

      <PromptDialog
        visible={editVisible}
        title="Editar equipo"
        fields={[
          { key: 'name', label: 'Nombre' },
          { key: 'crestUrl', label: 'Escudo (URL, opcional)', placeholder: 'https://...' },
        ]}
        initialValues={{ name: editing?.name, crestUrl: editing?.crestUrl }}
        onCancel={() => { setEditVisible(false); setEditing(null); }}
        onSubmit={submitEdit}
        confirmText="Guardar"
        cancelText="Cancelar"
      />
    </View>
  );
}