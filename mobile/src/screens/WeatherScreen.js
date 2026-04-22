import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { getCurrentWeather, getWeatherForecast } from '../services/weatherService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      await fetchWeather(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    const current = await getCurrentWeather(lat, lon);
    const forecastData = await getWeatherForecast(lat, lon, 3);
    setWeather(current);
    setForecast(forecastData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchWeather(location.coords.latitude, location.coords.longitude);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.center}>
        <Text>Unable to load weather data</Text>
      </View>
    );
  }

  const getWeatherIcon = (iconCode) => {
    const icons = {
      '01d': 'weather-sunny',
      '02d': 'weather-partly-cloudy',
      '03d': 'weather-cloudy',
      '04d': 'weather-cloudy',
      '09d': 'weather-pouring',
      '10d': 'weather-rainy',
      '11d': 'weather-lightning',
      '13d': 'weather-snowy',
      '50d': 'weather-fog'
    };
    return icons[iconCode] || 'weather-cloudy';
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Current Weather Card */}
      <View style={styles.currentCard}>
        <Text style={styles.location}>{weather.name}</Text>
        <Icon name={getWeatherIcon(weather.weather[0].icon)} size={80} color="#FFF" />
        <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
        <Text style={styles.description}>{weather.weather[0].description}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="water-percent" size={24} color="#FFF" />
            <Text style={styles.detailText}>Humidity {weather.main.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="weather-windy" size={24} color="#FFF" />
            <Text style={styles.detailText}>Wind {Math.round(weather.wind.speed)} km/h</Text>
          </View>
        </View>
      </View>

      {/* 3-Day Forecast */}
      <Text style={styles.sectionTitle}>3-Day Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
        {forecast && forecast.list.filter((_, idx) => idx % 8 === 0).slice(0, 3).map((item, idx) => (
          <View key={idx} style={styles.forecastCard}>
            <Text style={styles.forecastDay}>{getDayName(item.dt_txt)}</Text>
            <Icon name={getWeatherIcon(item.weather[0].icon)} size={40} color="#4CAF50" />
            <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
          </View>
        ))}
      </ScrollView>

      {/* Irrigation Advice based on weather */}
      <View style={styles.adviceCard}>
        <Icon name="lightbulb-on" size={28} color="#FFC107" />
        <Text style={styles.adviceTitle}>Weather-Based Advice</Text>
        <Text style={styles.adviceText}>
          {weather.weather[0].main === 'Rain' 
            ? "Rain expected today. Skip irrigation to save water."
            : weather.main.temp > 30 
              ? "High temperature. Consider watering early morning or evening."
              : weather.main.humidity > 70
                ? "High humidity. Reduce watering to prevent fungal growth."
                : "Good weather for normal irrigation schedule."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8F0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  currentCard: {
    backgroundColor: '#33be38',
    margin: 16,
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
  },
  location: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  temp: { fontSize: 64, fontWeight: 'bold', color: '#FFF', marginVertical: 10 },
  description: { fontSize: 18, color: '#FFF', textTransform: 'capitalize' },
  detailsRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%' },
  detailItem: { alignItems: 'center' },
  detailText: { color: '#FFF', marginTop: 5 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  forecastScroll: { paddingHorizontal: 16 },
  forecastCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    elevation: 2,
  },
  forecastDay: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  forecastTemp: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  adviceCard: {
    backgroundColor: '#FFF9C4',
    margin: 16,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  adviceTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  adviceText: { fontSize: 14, color: '#555', marginTop: 5, marginLeft: 38 },
});