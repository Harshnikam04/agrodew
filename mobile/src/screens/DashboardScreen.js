import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { getCurrentWeather } from '../services/weatherService';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fakeSoil, setFakeSoil] = useState(450);
  const [fakeWater, setFakeWater] = useState(75);

  // Generate fake sensor data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeSoil(prev => {
        let newVal = prev + Math.floor(Math.random() * 21) - 10;
        if (newVal < 200) return 200;
        if (newVal > 800) return 800;
        return newVal;
      });
      setFakeWater(prev => {
        let newVal = prev + Math.floor(Math.random() * 11) - 5;
        if (newVal < 10) return 10;
        if (newVal > 100) return 100;
        return newVal;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const weatherData = await getCurrentWeather(loc.coords.latitude, loc.coords.longitude);
      setWeather(weatherData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationAndWeather();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const getSoilStatus = (value) => {
    if (value < 300) return { text: 'Dry', color: '#F44336', icon: 'weather-sunny' };
    if (value < 600) return { text: 'Moderate', color: '#FFC107', icon: 'water-percent' };
    return { text: 'Wet', color: '#4CAF50', icon: 'water' };
  };

  const soilStatus = getSoilStatus(fakeSoil);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Gradient */}
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Text style={styles.greeting}>🌾 Good Morning, Farmer!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </LinearGradient>

      {/* Weather Card */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherRow}>
            <Icon name={weather.weather[0].icon === '01d' ? 'weather-sunny' : 'weather-cloudy'} size={48} color="#FFC107" />
            <View style={styles.weatherTemp}>
              <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
              <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Icon name="water-percent" size={20} color="#FFF" />
              <Text style={styles.detailText}>Humidity {weather.main.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="weather-windy" size={20} color="#FFF" />
              <Text style={styles.detailText}>Wind {Math.round(weather.wind.speed)} km/h</Text>
            </View>
          </View>
        </View>
      )}

      {/* Fake Sensor Cards */}
      <Text style={styles.sectionTitle}>Farm Sensors (Demo)</Text>
      <View style={styles.sensorGrid}>
        <View style={styles.sensorCard}>
          <Icon name="flower" size={32} color={soilStatus.color} />
          <Text style={styles.sensorLabel}>Soil Moisture</Text>
          <Text style={[styles.sensorValue, { color: soilStatus.color }]}>{fakeSoil}</Text>
          <Text style={styles.sensorStatus}>{soilStatus.text}</Text>
        </View>
        <View style={styles.sensorCard}>
          <Icon name="water" size={32} color="#00BCD4" />
          <Text style={styles.sensorLabel}>Water Level</Text>
          <Text style={[styles.sensorValue, { color: fakeWater < 20 ? '#F44336' : '#00BCD4' }]}>{fakeWater}%</Text>
          <Text style={styles.sensorStatus}>{fakeWater < 20 ? 'Low' : fakeWater > 80 ? 'Full' : 'Normal'}</Text>
        </View>
      </View>

      {/* Irrigation Advice */}
      <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.adviceCard}>
        <Icon name="lightbulb-on" size={28} color="#FFC107" />
        <Text style={styles.adviceTitle}>Smart Advice</Text>
        <Text style={styles.adviceText}>
          {fakeSoil < 300
            ? '🌱 Soil is dry. Consider watering soon.'
            : fakeSoil > 600
            ? '💧 Soil is wet. Skip irrigation today.'
            : '✅ Soil moisture is optimal.'}
          {fakeWater < 20 && ' ⚠️ Water level low – refill reservoir.'}
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 40, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  date: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  weatherCard: { backgroundColor: '#1E88E5', margin: 16, padding: 16, borderRadius: 20, elevation: 5 },
  weatherRow: { flexDirection: 'row', alignItems: 'center' },
  weatherTemp: { marginLeft: 15 },
  temp: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  weatherDesc: { fontSize: 16, color: '#FFF', textTransform: 'capitalize' },
  weatherDetails: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: '#FFF', marginLeft: 5 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sensorGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  sensorCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', width: (width - 48) / 2, elevation: 3 },
  sensorLabel: { fontSize: 14, color: '#666', marginTop: 8 },
  sensorValue: { fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  sensorStatus: { fontSize: 12, color: '#999' },
  adviceCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16, borderRadius: 16, flexWrap: 'wrap' },
  adviceTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  adviceText: { fontSize: 14, color: '#2E7D32', marginTop: 8, width: '100%' },
});