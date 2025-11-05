import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminMenuScreen from './AdminMenuScreen';
import TeamsAdminScreen from './TeamsAdminScreen';
import PlayersAdminScreen from './PlayersAdminScreen';
import MatchesAdminScreen from './MatchesAdminScreen';
import UsersAdminScreen from './UsersAdminScreen';
import NotificationsAdminScreen from './NotificationsAdminScreen';

// Estas dos pantallas viven fuera de la carpeta admin
import StatsScreen from '../StatsScreen';
import VenuesMapScreen from '../VenuesMapScreen';
// Nueva: subir foto de jugador
import PlayerPhotoScreen from '../PlayerPhotoScreen';

export type AdminStackParamList = {
  AdminMenu: undefined;
  AdminTeams: undefined;
  AdminPlayers: undefined;
  AdminMatches: undefined;
  AdminUsers: undefined;

  AdminStats: undefined;
  AdminVenuesMap: undefined;
  AdminNotifications: undefined;

  // Nueva ruta
  AdminPlayerPhoto: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminMenu">
      <Stack.Screen name="AdminMenu" component={AdminMenuScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="AdminTeams" component={TeamsAdminScreen} options={{ title: 'Equipos (ABM)' }} />
      <Stack.Screen name="AdminPlayers" component={PlayersAdminScreen} options={{ title: 'Jugadores (ABM)' }} />
      <Stack.Screen name="AdminMatches" component={MatchesAdminScreen} options={{ title: 'Partidos (ABM)' }} />
      <Stack.Screen name="AdminUsers" component={UsersAdminScreen} options={{ title: 'Usuarios (ABM)' }} />

      <Stack.Screen name="AdminStats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="AdminVenuesMap" component={VenuesMapScreen} options={{ title: 'Mapa de sedes' }} />
      <Stack.Screen name="AdminNotifications" component={NotificationsAdminScreen} options={{ title: 'Notificaciones' }} />

      {/* Nueva pantalla */}
      <Stack.Screen name="AdminPlayerPhoto" component={PlayerPhotoScreen} options={{ title: 'Subir foto de jugador' }} />
    </Stack.Navigator>
  );
}