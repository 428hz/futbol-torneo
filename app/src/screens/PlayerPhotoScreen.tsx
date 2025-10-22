import React from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';

export default function PlayerPhotoScreen({ route }: any) {
  const { playerId, token } = route.params;
  const [image, setImage] = React.useState<string | null>(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Se necesita permiso de cámara');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const upload = async () => {
    if (!image) return;
    const form = new FormData();
    form.append('file', { uri: image, name: 'photo.jpg', type: 'image/jpeg' } as any);
    const r = await fetch(`${API_URL}/players/${playerId}/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (r.ok) Alert.alert('OK', 'Foto actualizada'); else Alert.alert('Error', 'No se pudo subir');
  };

  return (
    <View style={{ padding: 16 }}>
      {image ? <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom: 12 }} /> : null}
      <Button title="Tomar foto" onPress={takePhoto} />
      <View style={{ height: 8 }} />
      <Button title="Elegir de galería" onPress={pickImage} />
      <View style={{ height: 8 }} />
      <Button title="Subir" onPress={upload} />
    </View>
  );
}