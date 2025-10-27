import React from 'react';
import { View, Text } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useGetVenuesQuery } from '../api';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function VenuesMapScreen() {
  const { data: venues } = useGetVenuesQuery();

  React.useEffect(() => {
    const id = 'leaflet-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  const center = venues?.length
    ? [venues[0].latitude, venues[0].longitude]
    : [-34.6037, -58.3816];

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:8 }}>Mapa de sedes</Text>
      <div style={{ height: 500, width: '100%', borderRadius: 8, overflow:'hidden' }}>
        <MapContainer center={center as any} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {(venues || []).map((v: any) => (
            <Marker key={v.id} position={[v.latitude, v.longitude] as any} icon={icon}>
              <Popup>
                <div>
                  <strong>{v.name}</strong>
                  {v.address ? <div>{v.address}</div> : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </View>
  );
}