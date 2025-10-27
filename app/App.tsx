import React from 'react';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation';
import { store } from './src/store';
import { setToken } from './src/api';

// Push token context + registrador (dentro de src/)
import { PushTokenProvider, usePushToken } from './src/context/PushTokenContext';
import PushTokenRegistrar from './src/context/PushTokenRegistrar';

function RegistrarBridge() {
  // Conecta el registrador con el contexto
  const { setPushToken } = usePushToken();
  return <PushTokenRegistrar onToken={setPushToken} />;
}

export default function App() {
  // Cargar JWT guardado para que la API agregue Authorization
  React.useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setToken(t);
    } catch {}
  }, []);

  // Ocultar warnings de desarrollo molestos en web
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const IGNORES = [
        'props.pointerEvents is deprecated',
        '"shadow" style props are deprecated',
      ];
      try { LogBox.ignoreLogs(IGNORES as any); } catch {}
      const origWarn = console.warn;
      console.warn = (...args: any[]) => {
        const msg = args?.[0];
        if (typeof msg === 'string' && IGNORES.some(s => msg.includes(s))) return;
        origWarn(...args);
      };
    }
  }, []);

  return (
    <Provider store={store}>
      <PushTokenProvider>
        {/* Registra el push token (iOS/Android). En web devuelve null y no rompe. */}
        <RegistrarBridge />
        <RootNavigator />
      </PushTokenProvider>
    </Provider>
  );
}