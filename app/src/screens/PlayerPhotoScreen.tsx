import React from 'react';
import { View, Text, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';

export default function PlayerPhotoScreen({ route }: any) {
  const playerId = route?.params?.id;
  const [uri, setUri] = React.useState<string | null>(null);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setUri(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) setUri(res.assets[0].uri);
  };

  const upload = async () => {
    try {
      if (!uri) return;
      const form = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const type = 'image/jpeg';
      form.append('file', { uri, name: filename, type } as any);

      // lee token de localStorage (web) o usa setToken pre-configurada en tu api
      let token: string | null = null;
      try { token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null; } catch {}

      const res = await fetch(`${API_URL}/players/${playerId}/photo`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(()=> ({}));
      if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
      Alert.alert('Listo', 'Foto actualizada');
    } catch (e:any) {
      Alert.alert('Error', e?.message || 'No se pudo subir la foto');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Foto del jugador #{playerId}</Text>
      {uri ? <Image source={{ uri }} style={{ width: 240, height: 240, borderRadius: 6, marginBottom: 12 }} /> : <Text style={{ color:'#666', marginBottom: 12 }}>Sin imagen seleccionada</Text>}
      <View style={{ flexDirection:'row', gap: 8, marginBottom: 8 }}>
        <Button title="Tomar foto" onPress={takePhoto} />
        <Button title="Elegir de galería" onPress={pickFromLibrary} />
      </View>
      <Button title="Subir" onPress={upload} disabled={!uri} />
    </View>
  );
}