// app/src/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { setCredentials } from './store/authSlice';
import { ActivityIndicator, View } from 'react-native';c

// Este componente se encarga de mostrar la app o una pantalla de carga
// mientras se verifica si hay una sesión activa.
const AppWrapper = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Esta función intentará cargar el token guardado (aún no implementado para nativo, pero sí para web)
    const bootstrapAsync = async () => {
      // Aquí iría la lógica para cargar el token desde AsyncStorage en móvil
      // Por ahora, Redux mantendrá el estado mientras la app esté abierta.
      // La persistencia real al cerrar y abrir la app requiere `redux-persist` y `AsyncStorage`.
      setIsLoading(false);
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppWrapper />
    </Provider>
  );
}