import React from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { API_URL } from '../config';
import { setToken } from '../services/api';
import { usePushToken } from '../context/PushTokenContext';

WebBrowser.maybeCompleteAuthSession();

function msgFromStatus(status: number, fallback: string) {
  if (status === 401) return 'Email o contraseña inválidos';
  if (status === 409) return 'Ese email ya está registrado';
  return fallback;
}
function goAdmin(navigation: any) {
  navigation.getParent()?.reset({ index: 1, routes: [{ name: 'Inicio' }, { name: 'Admin' }] });
}

export default function LoginScreen({ navigation }: any) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [registerMode, setRegisterMode] = React.useState(false);
  const { pushToken } = usePushToken();

  const googleExtra =
    (Constants?.expoConfig as any)?.extra?.google ||
    (Constants as any)?.manifest2?.extra?.google;

  const redirectUri = Platform.select({ web: window.location.origin, default: makeRedirectUri() }) as string;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleExtra?.webClientId || googleExtra?.expoClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri,
  });

  React.useEffect(() => {
    const handleGoogle = async () => {
      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;
        if (!idToken) { Alert.alert('Error', 'No se recibió idToken de Google'); return; }
        try {
          const res = await fetch(`${API_URL}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, pushToken: pushToken ?? undefined }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(msgFromStatus(res.status, data?.error || `Google login failed (${res.status})`));
          const jwt = data?.token; if (!jwt) throw new Error('Respuesta inválida (sin token)');
          setToken(jwt);
          try { localStorage.setItem('token', jwt); localStorage.setItem('user', JSON.stringify(data?.user ?? {})); } catch {}
          try { window.dispatchEvent(new Event('auth-changed')); } catch {}
          Alert.alert('Bienvenido', `Sesión iniciada como ${data?.user?.name || data?.user?.email || 'usuario'}`);
          goAdmin(navigation);
        } catch (e: any) { Alert.alert('Error', e?.message || 'Fallo login con Google'); }
      }
    };
    handleGoogle();
  }, [response, pushToken]);

  const onLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, pushToken: pushToken ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(msgFromStatus(res.status, data?.error || `Login failed (${res.status})`));
      const jwt = data?.token; if (!jwt) throw new Error('Respuesta inválida (sin token)');
      setToken(jwt);
      try { localStorage.setItem('token', jwt); localStorage.setItem('user', JSON.stringify(data?.user ?? {})); } catch {}
      try { window.dispatchEvent(new Event('auth-changed')); } catch {}
      Alert.alert('Bienvenido', `Sesión iniciada como ${data?.user?.name || data?.user?.email || 'usuario'}`);
      goAdmin(navigation);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Fallo de login');
    } finally { setLoading(false); }
  };

  const onRegister = async () => {
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert('Completar datos', 'Nombre, Email y Contraseña son obligatorios'); return;
      }
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(msgFromStatus(res.status, data?.error || `Register failed (${res.status})`));
      const jwt = data?.token; if (!jwt) throw new Error('Respuesta inválida (sin token)');
      setToken(jwt);
      try { localStorage.setItem('token', jwt); localStorage.setItem('user', JSON.stringify(data?.user ?? {})); } catch {}
      try { window.dispatchEvent(new Event('auth-changed')); } catch {}
      Alert.alert('Listo', `Cuenta creada para ${data?.user?.name || data?.user?.email}`);
      goAdmin(navigation);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Fallo de registro');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        {registerMode ? 'Crear cuenta' : 'Iniciar sesión'}
      </Text>

      {registerMode && (
        <TextInput placeholder="Nombre" value={name} onChangeText={setName}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }} />
      )}

      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 }} />

      {registerMode ? (
        <>
          <Button title={loading ? 'Creando...' : 'Crear cuenta'} onPress={onRegister} />
          <View style={{ height: 8 }} />
          <Button title="Ya tengo cuenta" onPress={() => setRegisterMode(false)} />
        </>
      ) : (
        <>
          <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={onLogin} />
          <View style={{ height: 16 }} />
          <Button title="Continuar con Google" onPress={() => promptAsync()} disabled={!request} />
          <View style={{ height: 8 }} />
          <Button title="Crear cuenta" onPress={() => setRegisterMode(true)} />
        </>
      )}
    </View>
  );
}