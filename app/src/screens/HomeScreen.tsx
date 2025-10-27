import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useGetUpcomingMatchesQuery, useGetFixtureQuery, useGetCardsByPlayerQuery, useGetCardsByTeamQuery } from '../api';

export default function HomeScreen() {
  const { data: upcoming } = useGetUpcomingMatchesQuery();
  const { data: fixture } = useGetFixtureQuery();
  const { data: cardsPlayers } = useGetCardsByPlayerQuery();
  const { data: cardsTeams } = useGetCardsByTeamQuery();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={{ fontWeight:'bold', fontSize: 18, marginBottom: 8 }}>Próximos partidos</Text>
      {(upcoming||[]).slice(0,5).map(m=>(
        <Text key={m.id}>#{m.id} {m.homeTeam.name} vs {m.awayTeam.name} · {new Date(m.datetime).toLocaleString()}</Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 18, marginVertical: 12 }}>Tarjetas por jugador (Top)</Text>
      {(cardsPlayers||[]).slice(0,10).map((c:any)=>(
        <Text key={c.playerId}>{c.name} ({c.team}) · Amarillas: {c.yellow} · Rojas: {c.red} · Total: {c.total}</Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 18, marginVertical: 12 }}>Tarjetas por equipo</Text>
      {(cardsTeams||[]).slice(0,10).map((c:any)=>(
        <Text key={c.teamId}>{c.teamName} · Amarillas: {c.yellow} · Rojas: {c.red} · Total: {c.total}</Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 18, marginVertical: 12 }}>Últimos partidos</Text>
      {(fixture||[]).slice(-5).map(m=>(
        <Text key={m.id}>#{m.id} {m.homeTeam.name} {m.homeScore} - {m.awayScore} {m.awayTeam.name}</Text>
      ))}
    </ScrollView>
  );
}