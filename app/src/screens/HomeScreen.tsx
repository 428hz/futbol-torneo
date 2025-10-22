// app/src/screens/HomeScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useGetUpcomingMatchesQuery } from '../services/api'; // Asegúrate de que la ruta sea correcta

export default function HomeScreen() {
  // Usaremos el hook de RTK Query que ya tienes, es más eficiente
  const { data: upcoming, error, isLoading, refetch } = useGetUpcomingMatchesQuery();

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
    }

    if (error) {
      return <Text style={styles.error}>Error al cargar los partidos.</Text>;
    }

    if (!upcoming || upcoming.length === 0) {
      return <Text style={styles.muted}>No hay partidos próximos.</Text>;
    }

    return upcoming.map((m: any) => ( // Tipar 'm' como 'any' temporalmente si no tienes los tipos definidos
      <View key={m.id} style={styles.card}>
        <Text style={styles.item}>
          {m.homeTeam?.name ?? 'Equipo Local'} vs {m.awayTeam?.name ?? 'Equipo Visitante'}
        </Text>
        {/* === ESTA ES LA LÍNEA CORREGIDA === */}
        <Text style={styles.muted}>{new Date(m.datetime).toLocaleString()} • {m.venue?.name}</Text>
        
        {(m.homeScore != null && m.awayScore != null) && (
          <Text style={styles.result}>
            Resultado: {m.homeScore} - {m.awayScore}
          </Text>
        )}
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Próximos partidos</Text>
      <Button title="Refrescar" onPress={refetch} disabled={isLoading} />
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  error: { color: '#e11d48', marginTop: 10 },
  muted: { color: '#64748b' },
  card: { padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, gap: 4 },
  item: { fontSize: 16, fontWeight: '600' },
  result: { fontWeight: '700' },
});