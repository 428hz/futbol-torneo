import React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TeamsListScreen from '../screens/Teams/TeamsListScreen';
import MatchesListScreen from '../screens/Matches/MatchesListScreen';
import AdminStack from '../screens/admin';
import LoginScreen from '../screens/LoginScreen';
import NotAllowedScreen from '../screens/admin/NotAllowedScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function readAuth() {
  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, role: user?.role as string | undefined };
  } catch {
    return { token: null, role: undefined };
  }
}

function AdminTabWrapper(props: any) {
  const [{ token, role }, setAuth] = React.useState(readAuth);
  const refresh = React.useCallback(() => setAuth(readAuth()), []);
  useFocusEffect(React.useCallback(() => { refresh(); return () => {}; }, [refresh]));
  React.useEffect(() => {
    const onStorage = () => refresh();
    const onAuthChanged = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed' as any, onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed' as any, onAuthChanged);
    };
  }, [refresh]);

  if (!token) return <LoginScreen {...props} />;
  if (role !== 'admin') return <NotAllowedScreen />; // ahora maneja navegación internamente

  return <AdminStack {...props} />;
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }} initialRouteName="Inicio">
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Equipos" component={TeamsListScreen} />
        <Tab.Screen name="Partidos" component={MatchesListScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
        <Tab.Screen name="Admin" component={AdminTabWrapper} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}