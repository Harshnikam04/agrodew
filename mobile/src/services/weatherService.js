import axios from 'axios';

// Get your free API key from https://openweathermap.org/api
const WEATHER_API_KEY = '3b9078a29618c990b65cbbd92b62197a'
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getCurrentWeather(lat, lon) {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

export async function getWeatherForecast(lat, lon, days = 3) {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: days * 8 // 3-hour intervals, 8 per day
      }
    });
    return response.data;
  } catch (error) {
    console.error('Forecast error:', error);
    return null;
  }
}