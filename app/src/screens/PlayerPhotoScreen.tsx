import React from 'react';
import { View, Text, Button, Image, ActivityIndicator, Platform, Linking, ScrollView, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../config';
import { useGetPlayersQuery } from '../services/api';

// Toast simple in‑screen
function useToast() {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const [msg, setMsg] = React.useState<string>('');
  const show = (m: string) => {
    setMsg(m);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  const node = (
    <Animated.View style={{
      position: 'fixed' as any,
      left: 16, right: 16, bottom: 24,
      backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 14,
      borderRadius: 8, opacity, pointerEvents: 'none',
    }}>
      <Text style={{ color: '#fff', textAlign: 'center' }}>{msg}</Text>
    </Animated.View>
  );
  return { show, node };
}

export default function PlayerPhotoScreen() {
  const { data: players = [], isLoading: loadingPlayers, refetch } = useGetPlayersQuery();
  const [playerId, setPlayerId] = React.useState<number | null>(null);
  const [previewUri, setPreviewUri] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [lastUrl, setLastUrl] = React.useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (players.length && playerId == null) setPlayerId(players[0].id);
  }, [players]);

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') { toast.show('Necesitás habilitar la cámara'); return; }
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setPreviewUri(res.assets[0].uri);
  }

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') { toast.show('Necesitás habilitar la galería'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setPreviewUri(res.assets[0].uri);
  }

  async function upload() {
    try {
      if (!playerId) { toast.show('Elegí jugador'); return; }
      if (!previewUri) { toast.show('Elegí una imagen'); return; }
      setUploading(true);

      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      if (!token) { toast.show('Iniciá sesión'); return; }

      const form = new FormData();
      if (Platform.OS === 'web') {
        const resp = await fetch(previewUri);
        const blob = await resp.blob();
        form.append('file', blob, 'photo.jpg');
      } else {
        // @ts-ignore: RN permite { uri, name, type } en FormData
        form.append('file', { uri: previewUri, name: 'photo.jpg', type: 'image/jpeg' });
      }

      const res = await fetch(`${API_URL}/upload/${playerId}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` } as any,
        body: form,
      });

      let json: any = {};
      try { json = await res.json(); } catch { json = {}; }

      if (!res.ok) { toast.show(json?.error || `Error ${res.status}`); return; }

      const absolute = `${API_URL}${json.photoUrl}`;
      setLastUrl(absolute);
      toast.show('Foto subida ✔');

      if (Platform.OS === 'web') window.open(absolute, '_blank'); else Linking.openURL(absolute);
      refetch();
    } catch (e: any) {
      toast.show(e?.message || 'No se pudo subir la foto');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Subir foto de jugador</Text>

      {loadingPlayers ? (
        <ActivityIndicator />
      ) : (
        <Picker selectedValue={playerId ?? undefined} onValueChange={(v) => setPlayerId(Number(v))}>
          {players.map((p: any) => (
            <Picker.Item key={p.id} label={`${p.firstName} ${p.lastName} (${p.team?.name ?? 's/eq'})`} value={p.id} />
          ))}
        </Picker>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Cámara" onPress={pickFromCamera} />
        <Button title="Galería" onPress={pickFromLibrary} />
      </View>

      {previewUri && (
        <Image
          source={{ uri: previewUri }}
          style={{ width: 260, height: 260, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }}
          resizeMode="cover"
        />
      )}

      <View style={{ opacity: uploading ? 0.7 : 1 }}>
        <Button title={uploading ? 'Subiendo...' : 'Subir'} onPress={upload} disabled={uploading || !previewUri || !playerId} />
        {uploading && <View style={{ marginTop: 8 }}><ActivityIndicator /></View>}
      </View>

      {lastUrl && (
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#555' }}>Última subida</Text>
          <Button title="Ver imagen" onPress={() => {
            if (Platform.OS === 'web') window.open(lastUrl, '_blank'); else Linking.openURL(lastUrl);
          }} />
        </View>
      )}

      {toast.node}
    </ScrollView>
  );
}