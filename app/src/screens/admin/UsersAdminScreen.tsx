import React from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../../services/api';

export default function UsersAdminScreen() {
  const { data: users } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Usuarios</Text>
      <FlatList
        data={users || []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>{item.name} - {item.email} ({item.role})</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Hacer admin" onPress={async () => {
                try { await updateUser({ id: item.id, role: 'admin' }).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); }
              }} />
              <Button title="Borrar" color="red" onPress={async () => {
                try { await deleteUser(item.id).unwrap(); } catch { Alert.alert('Error', 'No se pudo'); }
              }} />
            </View>
          </View>
        )}
      />
    </View>
  );
}