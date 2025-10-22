import React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useLoginMutation } from '../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import * as Notifications from 'expo-notifications';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const onLogin = async () => {
    try {
      let pushToken: string | undefined;
      try {
        const perm = await Notifications.requestPermissionsAsync();
        if (perm.granted) {
          const tok = await Notifications.getExpoPushTokenAsync();
          pushToken = tok.data;
        }
      } catch {}
      const { token, user } = await login({ email, password, pushToken }).unwrap();
      dispatch(setCredentials({ token, user }));
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert('Error', e?.data?.error || 'Fallo de login');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>Iniciar sesión</Text>
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}
                 style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword}
                 style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 }} />
      <Button title={isLoading ? 'Ingresando...' : 'Ingresar'} onPress={onLogin} />
      <View style={{ height: 8 }} />
      <Button title="(Test) Ir a Main" onPress={() => navigation.replace('Main')} />
    </View>
  );
}