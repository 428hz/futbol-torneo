import React from 'react';
import { View, FlatList } from 'react-native';
import { useGetFixtureQuery } from '../services/api';
import MatchCard from '../components/MatchCard';

export default function MatchesScreen() {
  const { data } = useGetFixtureQuery();
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
      />
    </View>
  );
}
