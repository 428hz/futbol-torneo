#!/usr/bin/env bash
set -euo pipefail

# .env
cat > app/.env <<'EOF'
EXPO_PUBLIC_API_URL=http://localhost:4000
EOF

# package.json
cat > app/package.json <<'EOF'
{
  "name": "futbol-torneo-app",
  "version": "1.0.0",
  "private": true,
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.6.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.19",
    "@reduxjs/toolkit": "^2.2.7",
    "expo": "^51.0.0",
    "expo-application": "~6.0.1",
    "expo-constants": "~16.0.1",
    "expo-image-picker": "~15.0.7",
    "expo-location": "~17.0.1",
    "expo-notifications": "~0.28.13",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.3",
    "react-native-maps": "1.15.9",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "~3.31.1",
    "react-redux": "^9.1.2",
    "expo-auth-session": "^5.5.2"
  },
  "devDependencies": {
    "@types/react": "~18.2.79",
    "@types/react-native": "~0.73.0",
    "typescript": "~5.3.3"
  }
}
EOF

# app.json
cat > app/app.json <<'EOF'
{
  "expo": {
    "name": "Futbol Torneo",
    "slug": "futbol-torneo",
    "scheme": "futboltorneo",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ],
    "ios": {
      "supportsTablet": false
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": ["CAMERA", "ACCESS_FINE_LOCATION", "POST_NOTIFICATIONS"]
    },
    "web": {
      "bundler": "metro"
    },
    "extra": {
      "google": {
        "expoClientId": "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
        "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
        "androidClientId": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
        "webClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
      },
      "eas": {
        "projectId": "replace-with-your-id"
      }
    }
  }
}
EOF

# src/config.ts
cat > app/src/config.ts <<'EOF'
export const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';
EOF

# src/App.tsx
cat > app/src/App.tsx <<'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { Provider } from 'react-redux';
import { store } from './store';
import { registerForPushNotificationsAsync } from './services/notifications';

export default function App() {
  React.useEffect(() => {
    registerForPushNotificationsAsync().catch(console.warn);
  }, []);
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
EOF

# src/store/index.ts
cat > app/src/store/index.ts <<'EOF'
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

# src/services/api.ts
cat > app/src/services/api.ts <<'EOF'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation<{ token: string; user: any }, { email: string; password: string; pushToken?: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body })
    }),
    register: builder.mutation<{ token: string; user: any }, any>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body })
    }),
    googleLogin: builder.mutation<{ token: string; user: any }, { idToken: string; pushToken?: string }>({
      query: (body) => ({ url: '/auth/google/token', method: 'POST', body })
    }),
    getTeams: builder.query<any[], void>({ query: () => '/teams' }),
    getPlayers: builder.query<any[], void>({ query: () => '/players' }),
    getUpcomingMatches: builder.query<any[], void>({ query: () => '/matches/upcoming' }),
    getFixture: builder.query<any[], void>({ query: () => '/matches' }),
    getStandings: builder.query<any[], void>({ query: () => '/stats/standings' }),
    getTopScorers: builder.query<any[], void>({ query: () => '/stats/top-scorers' }),
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
  useGetTeamsQuery,
  useGetPlayersQuery,
  useGetUpcomingMatchesQuery,
  useGetFixtureQuery,
  useGetStandingsQuery,
  useGetTopScorersQuery
} = api;
EOF

# src/services/notifications.ts
cat > app/src/services/notifications.ts <<'EOF'
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false
  })
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) return;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('No permission for notifications');
    return;
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
EOF

# src/navigation/RootNavigator.tsx
cat > app/src/navigation/RootNavigator.tsx <<'EOF'
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Equipos" component={TeamsScreen} />
      <Tab.Screen name="Partidos" component={MatchesScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: 'Equipo' }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Partido' }} />
    </Stack.Navigator>
  );
}
EOF

# src/components/MatchCard.tsx
cat > app/src/components/MatchCard.tsx <<'EOF'
import React from 'react';
import { View, Text } from 'react-native';

export default function MatchCard({ match }: { match: any }) {
  const d = new Date(match.datetime);
  return (
    <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', marginVertical: 6, borderRadius: 8 }}>
      <Text>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
      <Text>{d.toLocaleString()} - {match.venue.name}</Text>
      {match.status === 'finished' ? (
        <Text>Resultado: {match.homeScore} - {match.awayScore}</Text>
      ) : null}
    </View>
  );
}
EOF

# screens/LoginScreen.tsx
cat > app/src/screens/LoginScreen.tsx <<'EOF'
import React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useLoginMutation, useGoogleLoginMutation } from '../services/api';
import { setToken } from '../services/api';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

  const googleExtra = (Constants?.expoConfig as any)?.extra?.google
    || (Constants as any)?.manifest2?.extra?.google;

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: googleExtra?.expoClientId,
    iosClientId: googleExtra?.iosClientId,
    androidClientId: googleExtra?.androidClientId,
    webClientId: googleExtra?.webClientId
  });

  React.useEffect(() => {
    const handleGoogle = async () => {
      if (response?.type === 'success') {
        const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
        const idToken = response.authentication?.idToken;
        if (!idToken) return Alert.alert('Error', 'No se recibió idToken de Google');
        try {
          const { token } = await googleLogin({ idToken, pushToken }).unwrap();
          setToken(token);
          navigation.replace('Main');
        } catch (e: any) {
          Alert.alert('Error', e?.data?.error || 'Fallo login con Google');
        }
      }
    };
    handleGoogle();
  }, [response]);

  const onLogin = async () => {
    try {
      const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      const { token } = await login({ email, password, pushToken }).unwrap();
      setToken(token);
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
      <View style={{ height: 16 }} />
      <Button
        title={isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}
EOF

# screens/HomeScreen.tsx
cat > app/src/screens/HomeScreen.tsx <<'EOF'
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useGetUpcomingMatchesQuery, useGetStandingsQuery, useGetTopScorersQuery } from '../services/api';
import MatchCard from '../components/MatchCard';

export default function HomeScreen() {
  const { data: matches } = useGetUpcomingMatchesQuery();
  const { data: standings } = useGetStandingsQuery();
  const { data: scorers } = useGetTopScorersQuery();

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Próximos partidos</Text>
      <FlatList
        data={matches || []}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <MatchCard match={item} />}
        style={{ marginBottom: 16 }}
      />
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Tabla de posiciones</Text>
      <FlatList
        data={standings || []}
        keyExtractor={item => String(item.teamId)}
        renderItem={({ item, index }) => (
          <Text>{index + 1}. {item.teamName} - {item.points} pts (DG {item.gd})</Text>
        )}
      />
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Goleadores</Text>
      <FlatList
        data={scorers || []}
        keyExtractor={item => String(item.playerId)}
        renderItem={({ item }) => (
          <Text>{item.name} ({item.team}) - {item.goals}</Text>
        )}
      />
    </View>
  );
}
EOF

# screens/TeamsScreen.tsx
cat > app/src/screens/TeamsScreen.tsx <<'EOF'
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useGetTeamsQuery } from '../services/api';

export default function TeamsScreen({ navigation }: any) {
  const { data } = useGetTeamsQuery();
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TeamDetail', { team: item })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              {item.crestUrl ? <Image source={{ uri: item.crestUrl }} style={{ width: 32, height: 32, marginRight: 8 }} /> : null}
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ marginLeft: 'auto' }}>{item.stats.points} pts</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
EOF

# screens/TeamDetailScreen.tsx
cat > app/src/screens/TeamDetailScreen.tsx <<'EOF'
import React from 'react';
import { View, Text, FlatList } from 'react-native';

export default function TeamDetailScreen({ route }: any) {
  const { team } = route.params;
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{team.name}</Text>
      <Text>Pts: {team.stats.points} | DG: {team.stats.gd}</Text>
      <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '600' }}>Jugadores</Text>
      <FlatList
        data={team.players}
        keyExtractor={(p: any) => String(p.id)}
        renderItem={({ item }) => (
          <Text>- #{item.jerseyNumber} {item.firstName} {item.lastName} ({item.position})</Text>
        )}
      />
    </View>
  );
}
EOF

# screens/MatchesScreen.tsx
cat > app/src/screens/MatchesScreen.tsx <<'EOF'
import React from 'react';
import { View, FlatList } from 'react-native';
import { useGetFixtureQuery } from '../services/api';
import MatchCard from '../components/MatchCard';

export default function MatchesScreen() {
  const { data } = useGetFixtureQuery();
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
      />
    </View>
  );
}
EOF

# screens/MatchDetailScreen.tsx
cat > app/src/screens/MatchDetailScreen.tsx <<'EOF'
import React from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MatchDetailScreen({ route }: any) {
  const { match } = route.params;
  const d = new Date(match.datetime);
  const { width } = Dimensions.get('window');
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {match.homeTeam.name} vs {match.awayTeam.name}
      </Text>
      <Text>{d.toLocaleString()}</Text>
      <Text>Estadio: {match.venue.name}</Text>

      <MapView
        style={{ width: width - 24, height: 200, marginVertical: 8 }}
        initialRegion={{
          latitude: match.venue.latitude,
          longitude: match.venue.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}>
        <Marker coordinate={{ latitude: match.venue.latitude, longitude: match.venue.longitude }} title={match.venue.name} />
      </MapView>

      {match.events?.length ? (
        <>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Eventos</Text>
          <FlatList
            data={match.events}
            keyExtractor={(e: any) => String(e.id)}
            renderItem={({ item }) => (
              <Text>{item.minute}' {item.type} - {item.player ? item.player.firstName + ' ' + item.player.lastName : ''}</Text>
            )}
          />
        </>
      ) : null}
    </View>
  );
}
EOF

# screens/PlayerPhotoScreen.tsx
cat > app/src/screens/PlayerPhotoScreen.tsx <<'EOF'
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
      <Button title="Elegir foto" onPress={pickImage} />
      <Button title="Subir" onPress={upload} />
    </View>
  );
}
EOF

echo "App files written."