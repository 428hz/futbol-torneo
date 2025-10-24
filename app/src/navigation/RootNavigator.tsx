import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import LoginScreen from '../screens/LoginScreen';

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
    </Stack.Navigator>
  );
}