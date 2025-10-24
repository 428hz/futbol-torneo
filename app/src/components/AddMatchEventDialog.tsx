import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Team = { id: number; name: string };
type Player = { id: number; firstName: string; lastName: string; teamId: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { teamId: number; playerId?: number; type: 'goal'|'yellow'|'red'; minute?: number }) => void;
  homeTeam: Team;
  awayTeam: Team;
  players: Player[];
};

const TYPES = [
  { value: 'goal', label: 'Gol' },
  { value: 'yellow', label: 'Tarjeta amarilla' },
  { value: 'red', label: 'Tarjeta roja' },
] as const;

export default function AddMatchEventDialog({ visible, onClose, onSubmit, homeTeam, awayTeam, players }: Props) {
  const [teamId, setTeamId] = React.useState<number | undefined>();
  const [playerId, setPlayerId] = React.useState<number | undefined>();
  const [type, setType] = React.useState<'goal'|'yellow'|'red'>('goal');
  const [minute, setMinute] = React.useState<string>('0');

  React.useEffect(() => {
    if (!visible) {
      setTeamId(undefined);
      setPlayerId(undefined);
      setType('goal');
      setMinute('0');
    }
  }, [visible]);

  const playersOfTeam = teamId ? players.filter(p => p.teamId === teamId) : [];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.title}>Anotar evento</Text>

          <Text style={s.label}>Equipo</Text>
          <View style={s.pickerBox}>
            <Picker selectedValue={teamId} onValueChange={(v)=> setTeamId(v === undefined ? undefined : Number(v))} style={s.picker}>
              <Picker.Item label="Seleccioná equipo" value={undefined} />
              <Picker.Item label={homeTeam.name} value={homeTeam.id} />
              <Picker.Item label={awayTeam.name} value={awayTeam.id} />
            </Picker>
          </View>

          <Text style={s.label}>Jugador (opcional)</Text>
          <View style={s.pickerBox}>
            <Picker selectedValue={playerId} onValueChange={(v)=> setPlayerId(v === undefined ? undefined : Number(v))} style={s.picker}>
              <Picker.Item label="Sin jugador" value={undefined} />
              {playersOfTeam.map(p => (
                <Picker.Item key={p.id} label={`${p.firstName} ${p.lastName}`} value={p.id} />
              ))}
            </Picker>
          </View>

          <Text style={s.label}>Tipo</Text>
          <View style={s.pickerBox}>
            <Picker selectedValue={type} onValueChange={(v)=> setType(v)} style={s.picker}>
              {TYPES.map(t => <Picker.Item key={t.value} label={t.label} value={t.value} />)}
            </Picker>
          </View>

          <Text style={s.label}>Minuto</Text>
          <TextInput value={minute} onChangeText={setMinute} keyboardType="numeric" style={s.input} />

          <View style={s.row}>
            <Pressable style={[s.btn, s.btnGhost]} onPress={onClose}><Text style={[s.btnText, s.btnGhostText]}>Cancelar</Text></Pressable>
            <Pressable
              style={[s.btn, s.btnPrimary]}
              onPress={() => {
                if (!teamId) return;
                onSubmit({ teamId, playerId, type, minute: Number(minute || 0) });
              }}
            >
              <Text style={[s.btnText, s.btnPrimaryText]}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', alignItems:'center', justifyContent:'center', padding:16 },
  card: { width:'100%', maxWidth:480, backgroundColor:'#fff', borderRadius:12, padding:16 },
  title: { fontSize:18, fontWeight:'700', marginBottom:8 },
  label: { marginTop: 8, marginBottom: 4, color:'#333' },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, paddingHorizontal:10, height:40 },
  pickerBox: { borderWidth:1, borderColor:'#ccc', borderRadius:6, height:40, justifyContent:'center', paddingHorizontal:6 },
  picker: { height: 36 },
  row: { flexDirection:'row', justifyContent:'flex-end', gap:8, marginTop:12 },
  btn: { paddingVertical:10, paddingHorizontal:16, borderRadius:8 },
  btnText: { fontWeight:'600' },
  btnGhost: { backgroundColor:'transparent', borderWidth:1, borderColor:'#ccc' },
  btnGhostText: { color:'#333' },
  btnPrimary: { backgroundColor:'#1677ff' },
  btnPrimaryText: { color:'#fff' },
});