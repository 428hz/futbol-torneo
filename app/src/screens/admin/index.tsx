import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminMenuScreen from './AdminMenuScreen';
import TeamsAdminScreen from './TeamsAdminScreen';
import PlayersAdminScreen from './PlayersAdminScreen';
import MatchesAdminScreen from './MatchesAdminScreen';
import UsersAdminScreen from './UsersAdminScreen';
// Si querés sumar sedes al menú:
// import VenuesAdminScreen from './VenuesAdminScreen';

export type AdminStackParamList = {
  AdminMenu: undefined;
  AdminTeams: undefined;
  AdminPlayers: undefined;
  AdminMatches: undefined;
  AdminUsers: undefined;
  // AdminVenues: undefined;
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
      {/* <Stack.Screen name="AdminVenues" component={VenuesAdminScreen} options={{ title: 'Sedes (ABM)' }} /> */}
    </Stack.Navigator>
  );
}