import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useGetUsersQuery, useRegisterMutation, useUpdateUserMutation, useDeleteUserMutation } from '../../services/api';

export default function UsersAdminScreen() {
  const { data: users, refetch, isFetching } = useGetUsersQuery();
  const [register, { isLoading: creating }] = useRegisterMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('fan'); // admin | player | fan
  const [teamId, setTeamId] = React.useState('');

  const onCreate = async () => {
    try {
      await register({ name, email, password, role: role as any, teamId: teamId ? Number(teamId) : undefined }).unwrap();
      setName(''); setEmail(''); setPassword(''); setRole('fan'); setTeamId('');
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear usuario');
    }
  };

  const onEdit = async (u: any) => {
    const newRole = prompt('Rol (admin/player/fan)', u.role) || u.role;
    const newTeamIdStr = prompt('Team ID (vacío para null)', u.teamId ?? '') || '';
    try {
      await updateUser({ id: u.id, role: newRole, teamId: newTeamIdStr ? Number(newTeamIdStr) : null }).unwrap();
      refetch();
    } catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo actualizar'); }
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar usuario?')) return;
    try { await deleteUser(id).unwrap(); refetch(); }
    catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Crear usuario</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Rol (admin/player/fan)" value={role} onChangeText={setRole} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Team ID (opcional)" keyboardType="numeric" value={teamId} onChangeText={setTeamId} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} />

      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 12 }}>Listado</Text>
      <FlatList
        refreshing={isFetching}
        onRefresh={refetch}
        data={users || []}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text>#{item.id} {item.name} - {item.email} - rol: {item.role} - teamId: {String(item.teamId ?? '')}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button title="Editar" onPress={() => onEdit(item)} />
              <Button title="Eliminar" color="#c00" onPress={() => onDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}