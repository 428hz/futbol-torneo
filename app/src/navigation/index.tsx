import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TeamsListScreen from '../screens/Teams/TeamsListScreen';
import MatchesListScreen from '../screens/Matches/MatchesListScreen';
import UsersListScreen from '../screens/Users/UsersListScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Equipos" component={TeamsListScreen} />
        <Tab.Screen name="Partidos" component={MatchesListScreen} />
        <Tab.Screen name="Usuarios" component={UsersListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}