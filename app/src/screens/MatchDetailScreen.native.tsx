import React from 'react';
import { View, Text, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Venue = { name: string; latitude: number; longitude: number; address?: string };

export default function MatchDetailScreen({ route }: any) {
  const { match } = route.params as {
    match: {
      id: number;
      homeTeam: { name: string };
      awayTeam: { name: string };
      datetime: string;
      venue?: Venue | null;
      events?: Array<{ id: number; minute: number; type: string; playerName?: string; team?: 'home' | 'away' }>;
      homeScore?: number;
      awayScore?: number;
    };
  };

  const renderMap = (venue: Venue) => (
    <View style={{ width: '100%', height: 220, marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: venue.latitude,
          longitude: venue.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
          title={venue.name}
          description={venue.address}
        />
      </MapView>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {match.homeTeam.name} {match.homeScore ?? 0} - {match.awayScore ?? 0} {match.awayTeam.name}
      </Text>
      <Text>{new Date(match.datetime).toLocaleString()}</Text>
      {match.venue ? renderMap(match.venue) : <Text style={{ marginTop: 12 }}>Sede sin ubicación</Text>}

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Eventos</Text>
      <FlatList
        style={{ marginTop: 6 }}
        data={match.events || []}
        keyExtractor={(e) => String(e.id)}
        renderItem={({ item }) => (
          <Text>
            {item.minute}' {item.type} {item.playerName ? `- ${item.playerName}` : ''} {item.team ? `(${item.team})` : ''}
          </Text>
        )}
        ListEmptyComponent={<Text>No hay eventos</Text>}
      />
    </View>
  );
}