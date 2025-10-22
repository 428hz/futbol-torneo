// app/src/screens/admin/TeamsAdminScreen.tsx

import React from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useGetTeamsQuery, useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation } from '../../services/api';

export default function TeamsAdminScreen() {
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const [name, setName] = React.useState('');
  const [crestUrl, setCrestUrl] = React.useState('');
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const add = async () => {
    if (!name.trim()) return;
    try {
      await createTeam({ name: name.trim(), crestUrl: crestUrl.trim() || undefined }).unwrap();
      setName(''); setCrestUrl('');
    } catch (e: any) { Alert.alert('Error', e?.data?.error || 'No se pudo crear'); }
  };

  const saveRename = async () => {
    if (!editId) return;
    try {
      await updateTeam({ id: editId, name: editName }).unwrap();
      setEditId(null); setEditName('');
    } catch { Alert.alert('Error', 'No se pudo actualizar'); }
  };

  // --- FUNCIÓN DE BORRADO CON ALERTA ---
  const handleDelete = (id: number, teamName: string) => {
    Alert.alert(
      "Confirmar Borrado", // Título de la alerta
      `¿Estás seguro de que quieres borrar el equipo "${teamName}"? Esta acción no se puede deshacer.`, // Mensaje
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sí, Borrar",
          onPress: async () => {
            try {
              await deleteTeam(id).unwrap();
            } catch {
              Alert.alert('Error', 'No se pudo borrar el equipo');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nuevo equipo</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
      <TextInput placeholder="URL escudo (opcional)" value={crestUrl} onChangeText={setCrestUrl} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
      <Button title={isCreating ? "Agregando..." : "Agregar"} onPress={add} disabled={isCreating} />
      
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Equipos</Text>
      <FlatList
        data={teams || []}
        keyExtractor={(i) => String(i.id)}
        refreshing={isLoadingTeams}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>{item.name}</Text>
            {editId === item.id ? (
              <View>
                <TextInput placeholder="Nuevo nombre" value={editName} onChangeText={setEditName} style={{ borderWidth: 1, marginVertical: 6, padding: 8 }} />
                <Button title={isUpdating ? "Guardando..." : "Guardar"} onPress={saveRename} disabled={isUpdating}/>
                <Button title="Cancelar" onPress={() => { setEditId(null); setEditName(''); }} />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Button title="Renombrar" onPress={() => { setEditId(item.id); setEditName(item.name); }} />
                {/* Llamamos a la nueva función handleDelete */}
                <Button title="Borrar" color="red" onPress={() => handleDelete(item.id, item.name)} />
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}