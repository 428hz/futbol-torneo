import React from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import { setToken } from '../services/api';
import { API_URL } from '../config';
import * as Notifications from 'expo-notifications';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

async function getPushToken(): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  try { return (await Notifications.getExpoPushTokenAsync()).data; } catch { return undefined; }
}

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = React.useState('admin@test.com');
  const [password, setPassword] = React.useState('123456');
  const [loading, setLoading] = React.useState(false);

  const googleExtra =
    (Constants?.expoConfig as any)?.extra?.google ||
    (Constants as any)?.manifest2?.extra?.google;

  // Config mínima: clientId (web) + scopes + id_token
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleExtra?.webClientId || googleExtra?.expoClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
  });

  React.useEffect(() => {
    const handleGoogle = async () => {
      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;
        if (!idToken) {
          Alert.alert('Error', 'No se recibió idToken de Google');
          return;
        }
        try {
          const pushToken = await getPushToken();
          const res = await fetch(`${API_URL}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, pushToken }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || `Google login failed (${res.status})`);
          const jwt = data?.token;
          if (!jwt) throw new Error('Respuesta inválida del servidor (sin token)');
          setToken(jwt);
          if (typeof window !== 'undefined') window.localStorage.setItem('token', jwt);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (e: any) {
          console.error('google login error', e);
          Alert.alert('Error', e?.message || 'Fallo login con Google');
        }
      }
    };
    handleGoogle();
  }, [response]);

  const onLogin = async () => {
    try {
      setLoading(true);
      const pushToken = await getPushToken();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, pushToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Login failed (${res.status})`);
      const jwt = data?.token;
      if (!jwt) throw new Error('Respuesta inválida del servidor (sin token)');
      setToken(jwt);
      if (typeof window !== 'undefined') window.localStorage.setItem('token', jwt);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      console.error('login error', e);
      Alert.alert('Error', e?.message || 'Fallo de login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 }}
      />
      <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={onLogin} />
      <View style={{ height: 16 }} />
      <Button
        title={'Continuar con Google'}
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}