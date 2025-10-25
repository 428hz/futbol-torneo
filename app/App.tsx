import React from 'react';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation';
import { store } from './src/store';
import { setToken } from './src/api';

export default function App() {
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
      <RootNavigator />
    </Provider>
  );
}