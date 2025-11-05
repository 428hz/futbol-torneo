import React from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, FlatList, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import {
  useGetPlayersQuery,
  useGetTeamsQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} from '../../services/api';
import { API_URL } from '../../config';

type PlayerForm = {
  id?: number;
  firstName: string;
  lastName: string;
  age: string;
  position: string;
  jerseyNumber: string;
  teamId: string;
};

const POSITIONS = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];

export default function PlayersAdminScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { data: players = [], isLoading: loadingPlayers, refetch } = useGetPlayersQuery();
  const { data: teams = [], isLoading: loadingTeams } = useGetTeamsQuery();

  const [createPlayer, { isLoading: creating }] = useCreatePlayerMutation();
  const [updatePlayer, { isLoading: updating }] = useUpdatePlayerMutation();
  const [deletePlayer, { isLoading: deleting }] = useDeletePlayerMutation();

  const [editing, setEditing] = React.useState<PlayerForm | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('AdminPlayerPhoto')} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: '#1e90ff', fontWeight: 'bold' }}>Subir foto</Text>
        </Pressable>
      ),
      title: 'Jugadores (ABM)',
    });
  }, [navigation]);

  const startNew = () => {
    setEditing({
      firstName: '',
      lastName: '',
      age: '',
      position: POSITIONS[0],
      jerseyNumber: '',
      teamId: teams?.[0]?.id ? String(teams[0].id) : '',
    });
  };

  const startEdit = (p: any) => {
    setEditing({
      id: p.id,
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      age: String(p.age ?? ''),
      position: p.position ?? POSITIONS[0],
      jerseyNumber: String(p.jerseyNumber ?? ''),
      teamId: String(p.teamId ?? ''),
    });
  };

  const cancel = () => setEditing(null);

  const save = async () => {
    try {
      if (!editing) return;
      const age = Number(editing.age);
      const jerseyNumber = Number(editing.jerseyNumber);
      const teamId = Number(editing.teamId);
      if (!editing.firstName?.trim() || !editing.lastName?.trim()) {
        Alert.alert('Faltan datos', 'Nombre y Apellido son obligatorios');
        return;
      }
      if (!Number.isFinite(age) || !Number.isFinite(jerseyNumber) || !Number.isFinite(teamId)) {
        Alert.alert('Datos inválidos', 'Edad, N° de casaca y Team ID deben ser números');
        return;
      }

      if (editing.id) {
        await updatePlayer({
          id: editing.id,
          firstName: editing.firstName.trim(),
          lastName: editing.lastName.trim(),
          age,
          position: editing.position,
          jerseyNumber,
          teamId,
        }).unwrap();
      } else {
        await createPlayer({
          firstName: editing.firstName.trim(),
          lastName: editing.lastName.trim(),
          age,
          position: editing.position,
          jerseyNumber,
          teamId,
        }).unwrap();
      }

      setEditing(null);
      refetch();
    } catch (e: any) {
      console.error('save player error', e);
      Alert.alert('Error', e?.data?.error || e?.message || 'No se pudo guardar el jugador');
    }
  };

  const remove = (id: number) => {
    Alert.alert('Confirmar', '¿Eliminar jugador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlayer(id).unwrap();
            refetch();
          } catch (e: any) {
            console.error('delete player error', e);
            Alert.alert('Error', e?.data?.error || e?.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const Form = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{editing?.id ? 'Editar jugador' : 'Crear jugador'}</Text>
      <Text>Nombre</Text>
      <TextInput
        value={editing?.firstName}
        onChangeText={(t) => setEditing((s) => ({ ...(s as PlayerForm), firstName: t }))}
        style={styles.input}
      />
      <Text>Apellido</Text>
      <TextInput
        value={editing?.lastName}
        onChangeText={(t) => setEditing((s) => ({ ...(s as PlayerForm), lastName: t }))}
        style={styles.input}
      />
      <Text>Posición (Arquero/Defensor/Mediocampista/Delantero)</Text>
      <Picker
        selectedValue={editing?.position}
        onValueChange={(v) => setEditing((s) => ({ ...(s as PlayerForm), position: String(v) }))}
      >
        {POSITIONS.map((p) => <Picker.Item key={p} label={p} value={p} />)}
      </Picker>

      <Text>Edad</Text>
      <TextInput
        value={editing?.age}
        onChangeText={(t) => setEditing((s) => ({ ...(s as PlayerForm), age: t }))}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text>N° de casaca</Text>
      <TextInput
        value={editing?.jerseyNumber}
        onChangeText={(t) => setEditing((s) => ({ ...(s as PlayerForm), jerseyNumber: t }))}
        keyboardType="number-pad"
        style={styles.input}
      />

      <Text>Team ID</Text>
      <Picker
        selectedValue={editing?.teamId}
        onValueChange={(v) => setEditing((s) => ({ ...(s as PlayerForm), teamId: String(v) }))}
      >
        {teams.map((t: any) => (
          <Picker.Item key={t.id} label={`${t.name} (#${t.id})`} value={String(t.id)} />
        ))}
      </Picker>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Pressable style={[styles.btn, styles.btnCancel]} onPress={cancel}>
          <Text style={styles.btnTextWhite}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={save}
          disabled={creating || updating}
        >
          <Text style={styles.btnTextWhite}>{editing?.id ? 'Guardar' : 'Crear'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {(loadingPlayers || loadingTeams) && <ActivityIndicator />}

      {!editing && (
        <Pressable style={[styles.btn, styles.btnPrimary, { marginBottom: 12 }]} onPress={startNew}>
          <Text style={styles.btnTextWhite}>Nuevo jugador</Text>
        </Pressable>
      )}

      {editing ? (
        <Form />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(x: any) => String(x.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.photoUrl ? (
                <Image source={{ uri: `${API_URL}${item.photoUrl}` }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: '#ddd' }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.rowSub}>
                  {item.position} · #{item.jerseyNumber} · {item.team?.name ?? `Team ${item.teamId}`}
                </Text>
              </View>
              <Pressable style={[styles.smallBtn]} onPress={() => startEdit(item)}>
                <Text style={styles.smallBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => remove(item.id)}>
                <Text style={[styles.smallBtnText, { color: '#fff' }]}>Borrar</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1e90ff' },
  btnCancel: { backgroundColor: '#6c757d' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  rowTitle: { fontWeight: 'bold' },
  rowSub: { color: '#666' },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#eee', borderRadius: 4, marginLeft: 6 },
  smallBtnDanger: { backgroundColor: '#d9534f' },
  smallBtnText: { fontWeight: 'bold' },
  thumb: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
});