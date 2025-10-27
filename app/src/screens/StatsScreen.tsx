import React from 'react';
import { ScrollView, Text } from 'react-native';
import {
  useGetCardsByPlayerQuery,
  useGetCardsByTeamQuery,
  useGetStandingsQuery,
  useGetTopScorersQuery,
} from '../api';

export default function StatsScreen() {
  const { data: standings } = useGetStandingsQuery();
  const { data: scorers } = useGetTopScorersQuery();
  const { data: cardsPlayers } = useGetCardsByPlayerQuery();
  const { data: cardsTeams } = useGetCardsByTeamQuery();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <Text style={{ fontWeight:'bold', fontSize: 20, marginBottom: 10 }}>Tabla de Posiciones</Text>
      {(standings || []).map((s: any) => (
        <Text key={s.teamId}>
          {s.teamName} · PJ {s.played} · Pts {s.points} · GF {s.gf} · GC {s.ga} · DG {s.gd}
        </Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 20, marginVertical: 12 }}>Goleadores</Text>
      {(scorers || []).map((g: any) => (
        <Text key={g.playerId}>
          {g.name} ({g.team}) · {g.goals} gol(es)
        </Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 20, marginVertical: 12 }}>Tarjetas por jugador</Text>
      {(cardsPlayers || []).map((c: any) => (
        <Text key={c.playerId}>
          {c.name} ({c.team}) · Amarillas {c.yellow} · Rojas {c.red} · Total {c.total}
        </Text>
      ))}

      <Text style={{ fontWeight:'bold', fontSize: 20, marginVertical: 12 }}>Tarjetas por equipo</Text>
      {(cardsTeams || []).map((c: any) => (
        <Text key={c.teamId}>
          {c.teamName} · Amarillas {c.yellow} · Rojas {c.red} · Total {c.total}
        </Text>
      ))}
    </ScrollView>
  );
}