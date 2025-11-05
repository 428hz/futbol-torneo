import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useGetVenuesQuery } from '../services/api';

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14);
  }, [lat, lng]);
  return null;
}

export default function VenuesMapScreenWeb() {
  const { data: venues = [] } = useGetVenuesQuery();
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.warn('geolocation error', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const initial = me || { lat: venues[0]?.latitude ?? -34.6, lng: venues[0]?.longitude ?? -58.4 };

  return (
    <View style={{ flex: 1 }}>
      <div style={{ width: '100%', height: '100%' }}>
        <MapContainer center={[initial.lat, initial.lng]} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {venues.map((v: any) => (
            <Marker key={v.id} position={[v.latitude, v.longitude]}>
              <Popup>
                <b>{v.name}</b>
                <div>{v.address}</div>
              </Popup>
            </Marker>
          ))}
          {me && (
            <>
              <Marker position={[me.lat, me.lng]} icon={userIcon}>
                <Popup>Yo</Popup>
              </Marker>
              <FlyTo lat={me.lat} lng={me.lng} />
            </>
          )}
        </MapContainer>
      </div>
    </View>
  );
}