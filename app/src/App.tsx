import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { setToken } from './api';
// IMPORTA tu navegación raíz o componente principal
import RootNavigator from './navigation';

export default function App() {
  // Opcional: tomar el token guardado en web para que RTK Query mande Authorization
  React.useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setToken(t);
    } catch {}
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}