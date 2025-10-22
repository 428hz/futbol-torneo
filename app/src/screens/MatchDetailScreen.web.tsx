import React from 'react';
import { View, Text, FlatList, Pressable, Linking } from 'react-native';

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

  const renderVenue = (venue: Venue) => {
    const url = `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`;
    return (
      <View style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 12 }}>
        <Text style={{ fontWeight: 'bold' }}>Sede: {venue.name}</Text>
        {venue.address ? <Text>{venue.address}</Text> : null}
        <Text>Lat/Lon: {venue.latitude}, {venue.longitude}</Text>
        <Pressable onPress={() => Linking.openURL(url)} style={{ marginTop: 8 }}>
          <Text style={{ color: '#1e90ff' }}>Abrir en Google Maps</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {match.homeTeam.name} {match.homeScore ?? 0} - {match.awayScore ?? 0} {match.awayTeam.name}
      </Text>
      <Text>{new Date(match.datetime).toLocaleString()}</Text>
      {match.venue ? renderVenue(match.venue) : <Text style={{ marginTop: 12 }}>Sede sin ubicación</Text>}

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