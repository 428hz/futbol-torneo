import React from 'react';
import { View, Text } from 'react-native';

export default function MatchCard({ match }: { match: any }) {
  const d = new Date(match.datetime);
  return (
    <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', marginVertical: 6, borderRadius: 8 }}>
      <Text>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
      <Text>{d.toLocaleString()} - {match.venue.name}</Text>
      {match.status === 'finished' ? (
        <Text>Resultado: {match.homeScore} - {match.awayScore}</Text>
      ) : null}
    </View>
  );
}
