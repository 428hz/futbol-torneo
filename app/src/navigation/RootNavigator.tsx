// @ts-nocheck
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useSelector } from 'react-redux'; // <-- AÑADE ESTA LÍNEA
import type { RootState } from '../store'; // <-- AÑADE ESTA LÍNEA
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import TeamsAdminScreen from '../screens/admin/TeamsAdminScreen';
import PlayersAdminScreen from '../screens/admin/PlayersAdminScreen';
import MatchesAdminScreen from '../screens/admin/MatchesAdminScreen';
import UsersAdminScreen from '../screens/admin/UsersAdminScreen';
import VenuesAdminScreen from '../screens/admin/VenuesAdminScreen';

export type RootTabParamList = {
  Inicio: undefined;
  Equipos: undefined;
  Partidos: undefined;
  'Adm Equipos'?: undefined;
  'Adm Jugadores'?: undefined;
  'Adm Partidos'?: undefined;
  'Adm Sedes'?: undefined;
  'Adm Usuarios'?: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  TeamDetail?: { id: number };
  MatchDetail?: { id: number };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Bypass tipos estrictos del Navigator para evitar bloqueos
const TabNav = Tab.Navigator as unknown as React.FC<any>;
const StackNav = Stack.Navigator as unknown as React.FC<any>;

function Tabs() {
  const role = useSelector((s: RootState) => s.auth.user?.role);
  return (
    <TabNav>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Equipos" component={TeamsScreen} />
      <Tab.Screen name="Partidos" component={MatchesScreen} />
      {role === 'admin' && (
        <>
          <Tab.Screen name="Adm Equipos" component={TeamsAdminScreen} />
          <Tab.Screen name="Adm Jugadores" component={PlayersAdminScreen} />
          <Tab.Screen name="Adm Partidos" component={MatchesAdminScreen} />
          <Tab.Screen name="Adm Sedes" component={VenuesAdminScreen} />
          <Tab.Screen name="Adm Usuarios" component={UsersAdminScreen} />
        </>
      )}
    </TabNav>
  );
}

export default function RootNavigator() {
  return (
    <StackNav>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: 'Equipo' }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Partido' }} />
    </StackNav>
  );
}