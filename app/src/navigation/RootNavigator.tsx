import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pestañas principales
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import MatchesScreen from '../screens/MatchesScreen';

// Detalles
import TeamDetailScreen from '../screens/TeamDetailScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';

// Auth
import LoginScreen from '../screens/LoginScreen';

// Nuevas pantallas
import StatsScreen from '../screens/StatsScreen';
import VenuesMapScreen from '../screens/VenuesMapScreen';
import NotificationsAdminScreen from '../screens/admin/NotificationsAdminScreen';

// Importar desde el "barrel" de admin
import {
  AdminMenuScreen,
  TeamsAdminScreen,
  PlayersAdminScreen,
  MatchesAdminScreen,
  UsersAdminScreen,
} from '../screens/admin';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminStack() {
  const AdminStackNav = createNativeStackNavigator();
  return (
    <AdminStackNav.Navigator>
      <AdminStackNav.Screen name="AdminMenu" component={AdminMenuScreen} options={{ title: 'Admin' }} />
      <AdminStackNav.Screen name="AdminTeams" component={TeamsAdminScreen} options={{ title: 'Equipos (ABM)' }} />
      <AdminStackNav.Screen name="AdminPlayers" component={PlayersAdminScreen} options={{ title: 'Jugadores (ABM)' }} />
      <AdminStackNav.Screen name="AdminMatches" component={MatchesAdminScreen} options={{ title: 'Partidos (ABM)' }} />
      <AdminStackNav.Screen name="AdminUsers" component={UsersAdminScreen} options={{ title: 'Usuarios (ABM)' }} />
    </AdminStackNav.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Equipos" component={TeamsScreen} />
      <Tab.Screen name="Partidos" component={MatchesScreen} />
      <Tab.Screen name="Admin" component={AdminStack} options={{ headerShown: false }} />
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
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="VenuesMap" component={VenuesMapScreen} options={{ title: 'Mapa de sedes' }} />
      <Stack.Screen name="NotificationsAdmin" component={NotificationsAdminScreen} options={{ title: 'Notificaciones' }} />
    </Stack.Navigator>
  );
}