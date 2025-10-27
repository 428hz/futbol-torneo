import React from 'react';
import { Platform } from 'react-native';

// Registrador de push que usa import dinámico para no tocar módulos nativos
// antes de que el runtime esté listo.
export default function PushTokenRegistrar({ onToken }: { onToken: (t: string | null) => void }) {
  React.useEffect(() => {
    let mounted = true;

    async function register() {
      try {
        if (Platform.OS === 'web') { onToken(null); return; }

        // Cargamos expo-notifications de forma dinámica
        const Notifications = await import('expo-notifications');

        // Android: canal por defecto
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') { onToken(null); return; }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data || null;
        if (mounted) onToken(token);
      } catch (e) {
        if (mounted) onToken(null);
      }
    }

    register();
    return () => { mounted = false; };
  }, [onToken]);

  return null;
}