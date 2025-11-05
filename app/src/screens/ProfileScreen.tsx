import React from 'react';
import { View, Text, Image, Button, Platform, Linking, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';

function decodeJwtWeb(token: string | null) {
  try {
    if (!token || typeof window === 'undefined' || typeof window.atob !== 'function') return null;
    const payload = token.split('.')[1];
    const json = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      id: json.sub ?? json.id,
      email: json.email ?? undefined,
      name: json.name ?? json.given_name ?? undefined,
      role: json.role ?? undefined,
      teamId: json.teamId ?? undefined,
    };
  } catch { return null; }
}

function readLocal() {
  try {
    const uStr = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    const u = uStr ? JSON.parse(uStr) : {};
    const fromJwt = decodeJwtWeb(t);
    return { ...(fromJwt || {}), ...(u || {}) };
  } catch { return null; }
}

export default function ProfileScreen() {
  const [me, setMe] = React.useState<any>(readLocal());
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [lastUrl, setLastUrl] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string>('');

  // SIEMPRE intenta completar desde /auth/me al montar
  React.useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } as any });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json?.user) {
          const merged = { ...(readLocal() || {}), ...(json.user || {}) };
          setMe(merged);
          try { localStorage.setItem('user', JSON.stringify(merged)); } catch {}
          window.dispatchEvent(new Event('auth-changed'));
        }
      } catch {}
    };
    load();
  }, []);

  // Reaccionar a cambios de sesión
  React.useEffect(() => {
    const r = () => setMe(readLocal());
    window.addEventListener('storage', r);
    window.addEventListener('auth-changed' as any, r);
    return () => {
      window.removeEventListener('storage', r);
      window.removeEventListener('auth-changed' as any, r);
    };
  }, []);

  const pick = async () => {
    setMsg('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') { setMsg('Necesitás habilitar la galería'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setPreview(res.assets[0].uri);
  };

  const upload = async () => {
    try {
      setMsg('');
      if (!preview) { setMsg('Elegí una imagen'); return; }
      setUploading(true);
      const token = localStorage.getItem('token');
      if (!token) { setMsg('Iniciá sesión'); return; }
      const form = new FormData();
      if (Platform.OS === 'web') {
        const resp = await fetch(preview);
        const blob = await resp.blob();
        form.append('file', blob, 'profile.jpg');
      } else {
        // @ts-ignore
        form.append('file', { uri: preview, name: 'profile.jpg', type: 'image/jpeg' });
      }
      const res = await fetch(`${API_URL}/profile/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` } as any,
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(json?.error || `Error ${res.status}`); return; }
      const absolute = `${API_URL}${json.photoUrl}`;
      setLastUrl(absolute);
      setMsg('Foto de perfil subida ✔');

      // Limpiar preview después de subir
      setPreview(null);

      if (Platform.OS === 'web') window.open(absolute, '_blank'); else Linking.openURL(absolute);

      // Guardar en localStorage y estado
      try {
        const updated = { ...(me || {}), photoUrl: json.photoUrl };
        localStorage.setItem('user', JSON.stringify(updated));
        setMe(updated);
        window.dispatchEvent(new Event('auth-changed'));
      } catch {}
    } catch (e: any) {
      setMsg(e?.message || 'No se pudo subir la foto');
    } finally { setUploading(false); }
  };

  const avatarUri = me?.photoUrl ? `${API_URL}${me.photoUrl}` : undefined;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Mi perfil</Text>

      <Text>Nombre: {me?.name || '-'}</Text>
      <Text>Email: {me?.email || '-'}</Text>
      <Text>Rol: {me?.role || '-'}</Text>

      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#ccc' }} />
      ) : (
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' }} />
      )}

      {preview && (
        <Image source={{ uri: preview }} style={{ width: 240, height: 240, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }} />
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Elegir foto" onPress={pick} />
        <Button title={uploading ? 'Subiendo...' : 'Subir foto'} onPress={upload} disabled={uploading || !preview} />
      </View>

      {uploading && <ActivityIndicator />}

      {lastUrl && (
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#555' }}>Última subida</Text>
          <Button title="Ver imagen" onPress={() => {
            if (Platform.OS === 'web') window.open(lastUrl!, '_blank'); else Linking.openURL(lastUrl!);
          }} />
        </View>
      )}

      {msg ? <Text style={{ color: msg.includes('✔') ? 'green' : 'crimson' }}>{msg}</Text> : null}
    </ScrollView>
  );
}