import React from 'react';
import { Platform, View, ActivityIndicator, Text } from 'react-native';

// Wrapper LAZY: carga la implementación correcta sólo al renderizar,
// evitando evaluar módulos nativos antes de que el runtime esté listo.
export default function VenuesMapScreenWrapper(props: any) {
  const [Impl, setImpl] = React.useState<React.ComponentType<any> | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = Platform.OS === 'web'
          ? await import('./VenuesMapScreen.web')
          : await import('./VenuesMapScreen.native');
        if (mounted) setImpl(() => mod.default);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'No se pudo cargar el mapa');
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (err) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Mapa no disponible</Text>
        <Text style={{ color: '#c00' }}>{err}</Text>
      </View>
    );
  }

  if (!Impl) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando mapa…</Text>
      </View>
    );
    }

  const C = Impl;
  return <C {...props} />;
}