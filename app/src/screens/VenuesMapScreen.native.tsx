import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useGetVenuesQuery } from '../services/api';
import LocationGuard from '../guards/LocationGuard';

export default function VenuesMapScreenNative() {
  const { data: venues = [] } = useGetVenuesQuery();
  const [region, setRegion] = useState<Region>({
    latitude: venues[0]?.latitude ?? -34.6,
    longitude: venues[0]?.longitude ?? -58.4,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });
  const [me, setMe] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        setMe({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        // Centrar el mapa en mi ubicación cuando llega por primera vez
        setRegion((r) => ({
          ...r,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      } catch {
        // Si falla la obtención de ubicación, dejamos el region por defecto
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const { width, height } = Dimensions.get('window');

  return (
    <LocationGuard>
      <View style={{ flex: 1 }}>
        <MapView
          style={{ width, height }}
          region={region}
          onRegionChangeComplete={(r) => setRegion(r)}
        >
          {venues.map((v: any) => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.latitude, longitude: v.longitude }}
              title={v.name}
              description={v.address}
            />
          ))}
          {me && (
            <Marker
              coordinate={{ latitude: me.latitude, longitude: me.longitude }}
              title="Mi ubicación"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
    </LocationGuard>
  );
}