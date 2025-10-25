import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TeamsListScreen from '../screens/Teams/TeamsListScreen';
import MatchesListScreen from '../screens/Matches/MatchesListScreen';
// Importá el Stack de Admin (no el menú suelto)
import AdminStack from '../screens/admin';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }} initialRouteName="Inicio">
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Equipos" component={TeamsListScreen} />
        <Tab.Screen name="Partidos" component={MatchesListScreen} />
        <Tab.Screen name="Admin" component={AdminStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}