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

export type AdminStackParamList = {
  AdminMenu: undefined;
  AdminTeams: undefined;
  AdminPlayers: undefined;
  AdminMatches: undefined;
  AdminUsers: undefined;

  // Nuevas rutas dentro del stack de Admin
  AdminStats: undefined;
  AdminVenuesMap: undefined;
  AdminNotifications: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

// Export default: el stack de administración
export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminMenu">
      <Stack.Screen name="AdminMenu" component={AdminMenuScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="AdminTeams" component={TeamsAdminScreen} options={{ title: 'Equipos (ABM)' }} />
      <Stack.Screen name="AdminPlayers" component={PlayersAdminScreen} options={{ title: 'Jugadores (ABM)' }} />
      <Stack.Screen name="AdminMatches" component={MatchesAdminScreen} options={{ title: 'Partidos (ABM)' }} />
      <Stack.Screen name="AdminUsers" component={UsersAdminScreen} options={{ title: 'Usuarios (ABM)' }} />

      {/* Nuevas pantallas dentro del mismo stack de Admin */}
      <Stack.Screen name="AdminStats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="AdminVenuesMap" component={VenuesMapScreen} options={{ title: 'Mapa de sedes' }} />
      <Stack.Screen name="AdminNotifications" component={NotificationsAdminScreen} options={{ title: 'Notificaciones' }} />
    </Stack.Navigator>
  );
}

// Exports con nombre para poder importar desde '../screens/admin'
export { default as AdminMenuScreen } from './AdminMenuScreen';
export { default as TeamsAdminScreen } from './TeamsAdminScreen';
export { default as PlayersAdminScreen } from './PlayersAdminScreen';
export { default as MatchesAdminScreen } from './MatchesAdminScreen';
export { default as UsersAdminScreen } from './UsersAdminScreen';
export { default as VenuesAdminScreen } from './VenuesAdminScreen';
export { default as NotificationsAdminScreen } from './NotificationsAdminScreen';