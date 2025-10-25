import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import {
  useGetUsersQuery,
  useRegisterMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../../api'; // IMPORTANTE: antes estaba '../../services/api'
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptDialog from '../../components/PromptDialog';

export default function UsersAdminScreen() {
  const { data: users, refetch, isFetching, isError } = useGetUsersQuery();
  const [register, { isLoading: creating }] = useRegisterMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Crear
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'admin'|'player'|'fan'>('fan');
  const [teamId, setTeamId] = React.useState('');

  // Modales
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<{ id: number; name: string } | null>(null);

  const [editVisible, setEditVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const onCreate = async () => {
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return Alert.alert('Faltan datos', 'Nombre, email y password son obligatorios.');
      }
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        teamId: teamId ? Number(teamId) : undefined,
      }).unwrap();
      setName(''); setEmail(''); setPassword(''); setRole('fan'); setTeamId('');
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear usuario');
    }
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setEditVisible(true);
  };

  const submitEdit = async (values: Record<string, string>) => {
    try {
      const newRole = (values.role ?? '').trim() as 'admin'|'player'|'fan';
      if (!['admin','player','fan'].includes(newRole)) {
        return Alert.alert('Rol inválido', 'Usá admin, player o fan.');
      }
      const teamStr = (values.teamId ?? '').trim();
      const newTeamId = teamStr === '' ? null : Number(teamStr);
      if (teamStr !== '' && !Number.isFinite(newTeamId as number)) {
        return Alert.alert('Team ID inválido', 'Debe ser un número o vacío.');
      }
      await updateUser({ id: editing.id, role: newRole, teamId: newTeamId }).unwrap();
      setEditVisible(false); setEditing(null);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo actualizar');
    }
  };

  const askDelete = (u: any) => { setPendingDelete({ id: u.id, name: u.name }); setConfirmVisible(true); };
  const doDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUser(pendingDelete.id).unwrap();
      setConfirmVisible(false); setPendingDelete(null);
      refetch();
    } catch (e:any) {
      setConfirmVisible(false);
      Alert.alert('Error', e?.data?.error || 'No se pudo eliminar');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Crear usuario</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Rol (admin/player/fan)" value={role} onChangeText={(t)=>setRole(t as any)} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Team ID (opcional)" keyboardType="numeric" value={teamId} onChangeText={setTeamId} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} />

      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 12 }}>Listado</Text>

      {isError ? (
        <View>
          <Text style={{ color:'#c00' }}>No se pudieron cargar los usuarios (¿token?).</Text>
          <Text onPress={refetch} style={{ color:'#1677ff', marginTop: 6 }}>Reintentar</Text>
        </View>
      ) : null}

      <FlatList
        refreshing={isFetching}
        onRefresh={refetch}
        data={users || []}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text>#{item.id} {item.name} - {item.email} - rol: {item.role} - teamId: {String(item.teamId ?? '')}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button title="Editar" onPress={() => openEdit(item)} />
              <Button title="Eliminar" color="#c00" onPress={() => askDelete(item)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={!isFetching && !isError ? <Text style={{ color:'#666' }}>No hay usuarios</Text> : null}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar usuario"
        message={`¿Eliminar "${pendingDelete?.name}"?`}
        onConfirm={doDelete}
        onCancel={() => { setConfirmVisible(false); setPendingDelete(null); }}
      />

      <PromptDialog
        visible={editVisible}
        title="Editar usuario"
        fields={[
          { key: 'role', label: 'Rol (admin/player/fan)' },
          { key: 'teamId', label: 'Team ID (vacío para ninguno)', keyboardType: 'numeric' },
        ]}
        initialValues={{ role: editing?.role, teamId: editing?.teamId ?? '' }}
        onCancel={() => { setEditVisible(false); setEditing(null); }}
        onSubmit={submitEdit}
        confirmText="Guardar"
        cancelText="Cancelar"
      />
    </View>
  );
}