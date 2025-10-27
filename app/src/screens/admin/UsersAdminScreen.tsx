import React from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  useGetUsersQuery,
  useRegisterMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetTeamsQuery,
} from '../../api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function UsersAdminScreen() {
  const { data: users, refetch, isFetching, isError } = useGetUsersQuery();
  const { data: teams } = useGetTeamsQuery();
  const [register, { isLoading: creating }] = useRegisterMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Crear
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'admin'|'player'|'fan'>('fan');
  const [teamId, setTeamId] = React.useState<number | undefined>(undefined);

  // Eliminar
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<{ id: number; name: string } | null>(null);

  // Editar
  const [editVisible, setEditVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [editRole, setEditRole] = React.useState<'admin'|'player'|'fan'>('fan');
  const [editTeamId, setEditTeamId] = React.useState<number | null>(null);

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
        teamId: teamId ?? undefined,
      }).unwrap();
      setName(''); setEmail(''); setPassword(''); setRole('fan'); setTeamId(undefined);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'No se pudo crear usuario');
    }
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setEditRole(u.role);
    setEditTeamId(u.teamId ?? null);
    setEditVisible(true);
  };

  const submitEdit = async () => {
    try {
      await updateUser({ id: editing.id, role: editRole, teamId: editTeamId }).unwrap();
      setEditVisible(false); setEditing(null);
      refetch();
    } catch (e:any) { Alert.alert('Error', e?.data?.error || 'No se pudo actualizar'); }
  };

  const askDelete = (u: any) => { setPendingDelete({ id: u.id, name: u.name }); setConfirmVisible(true); };
  const doDelete = async () => {
    if (!pendingDelete) return;
    try { await deleteUser(pendingDelete.id).unwrap(); setConfirmVisible(false); setPendingDelete(null); refetch(); }
    catch (e:any) { setConfirmVisible(false); Alert.alert('Error', e?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Crear usuario</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />

      <Text style={{ marginTop: 6, marginBottom: 4 }}>Rol</Text>
      <View style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:6 }}>
        <Picker selectedValue={role} onValueChange={(v)=> setRole(v)} style={{ height: 36 }}>
          <Picker.Item label="fan" value="fan" />
          <Picker.Item label="player" value="player" />
          <Picker.Item label="admin" value="admin" />
        </Picker>
      </View>

      <Text style={{ marginTop: 6, marginBottom: 4 }}>Equipo (opcional)</Text>
      <View style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:6 }}>
        <Picker selectedValue={teamId} onValueChange={(v)=> setTeamId(v === undefined ? undefined : Number(v))} style={{ height: 36 }}>
          <Picker.Item label="(ninguno)" value={undefined} />
          {(teams||[]).map((t:any)=> <Picker.Item key={t.id} label={t.name} value={t.id} />)}
        </Picker>
      </View>

      <Button title={creating ? 'Creando...' : 'Crear'} onPress={onCreate} />

      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 12 }}>Listado</Text>
      {isError ? (
        <View>
          <Text style={{ color:'#c00' }}>No se pudieron cargar los usuarios.</Text>
          <Text onPress={refetch} style={{ color:'#1677ff', marginTop: 6 }}>Reintentar</Text>
        </View>
      ) : null}

      {(users || []).map((item:any) => (
        <View key={item.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text>#{item.id} {item.name} - {item.email} - rol: {item.role} - teamId: {String(item.teamId ?? '')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap:'wrap' }}>
            <Button title="Editar" onPress={() => openEdit(item)} />
            <Button title="Eliminar" color="#c00" onPress={() => askDelete(item)} />
          </View>
        </View>
      ))}

      {/* Modal de edición con Pickers */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={()=> setEditVisible(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', padding:16 }}>
          <View style={{ backgroundColor:'#fff', borderRadius:12, padding:16 }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Editar usuario</Text>

            <Text style={{ marginBottom:4 }}>Rol</Text>
            <View style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:8 }}>
              <Picker selectedValue={editRole} onValueChange={(v)=> setEditRole(v)} style={{ height: 36 }}>
                <Picker.Item label="fan" value="fan" />
                <Picker.Item label="player" value="player" />
                <Picker.Item label="admin" value="admin" />
              </Picker>
            </View>

            <Text style={{ marginBottom:4 }}>Equipo (opcional)</Text>
            <View style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6, marginBottom:12 }}>
              <Picker selectedValue={editTeamId ?? undefined} onValueChange={(v)=> setEditTeamId(v === undefined ? null : Number(v))} style={{ height: 36 }}>
                <Picker.Item label="(ninguno)" value={undefined} />
                {(teams||[]).map((t:any)=> <Picker.Item key={t.id} label={t.name} value={t.id} />)}
              </Picker>
            </View>

            <View style={{ flexDirection:'row', gap:8, justifyContent:'flex-end' }}>
              <Button title="Cancelar" onPress={()=> { setEditVisible(false); setEditing(null); }} />
              <Button title="Guardar" onPress={submitEdit} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar usuario"
        message={`¿Eliminar "${pendingDelete?.name}"?`}
        onConfirm={doDelete}
        onCancel={() => { setConfirmVisible(false); setPendingDelete(null); }}
      />
    </ScrollView>
  );
}