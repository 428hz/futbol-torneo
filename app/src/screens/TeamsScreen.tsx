import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useGetTeamsQuery } from '../services/api';

export default function TeamsScreen({ navigation }: any) {
  const { data } = useGetTeamsQuery();
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TeamDetail', { team: item })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              {item.crestUrl ? <Image source={{ uri: item.crestUrl }} style={{ width: 32, height: 32, marginRight: 8 }} /> : null}
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ marginLeft: 'auto' }}>{item.stats.points} pts</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
