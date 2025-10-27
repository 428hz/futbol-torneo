import React from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { API_URL } from '../../config';

export default function NotificationsAdminScreen() {
  const [title, setTitle] = React.useState('Aviso');
  const [body, setBody] = React.useState('Notificación');

  const send = async () => {
    try {
      let token: string | null = null;
      try { token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null; } catch {}
      const res = await fetch(`${API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json().catch(()=> ({}));
      if (!res.ok) throw new Error(data?.error || `Error (${res.status})`);
      Alert.alert('Listo', `Enviadas: ${data?.sent || 0}`);
    } catch (e:any) {
      Alert.alert('Error', e?.message || 'No se pudo enviar');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Enviar notificación</Text>
      <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginBottom:8 }} />
      <TextInput placeholder="Mensaje" value={body} onChangeText={setBody} multiline numberOfLines={4} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginBottom:12, minHeight:100 }} />
      <Button title="Enviar" onPress={send} />
    </ScrollView>
  );
}