import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useGetVenuesQuery } from '../api';

export default function VenuesMapScreen() {
  const { data: venues } = useGetVenuesQuery();
  const center = venues?.length
    ? { latitude: venues[0].latitude, longitude: venues[0].longitude }
    : { latitude: -34.6037, longitude: -58.3816 };

  return (
    <View style={{ padding: 12, flex: 1 }}>
      <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Mapa de sedes</Text>
      <MapView
        style={{ height: 500, width: '100%', borderRadius: 8 }}
        initialRegion={{ ...center, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        {(venues || []).map((v: any) => (
          <Marker
            key={v.id}
            coordinate={{ latitude: v.latitude, longitude: v.longitude }}
            title={v.name}
            description={v.address || ''}
          />
        ))}
      </MapView>
    </View>
  );
}