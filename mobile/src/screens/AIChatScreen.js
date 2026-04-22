import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { askFarmerQuestion } from '../services/aiService';
import { getCurrentWeather } from '../services/weatherService';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../services/firebase';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: "🌾 Hello Farmer! I'm Agrodew AI. Ask me about irrigation, weather, or crop care.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherContext, setWeatherContext] = useState('Unknown');
  const [soilContext, setSoilContext] = useState('Unknown');
  const flatListRef = useRef();

  // Get weather and fake soil context on mount
  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    // Get weather
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        const weather = await getCurrentWeather(loc.coords.latitude, loc.coords.longitude);
        if (weather) {
          setWeatherContext(`${weather.weather[0].description}, ${Math.round(weather.main.temp)}°C, humidity ${weather.main.humidity}%`);
        }
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }

    // Fake soil moisture (simulate for demo)
    const fakeSoil = Math.floor(Math.random() * (800 - 200 + 1) + 200);
    setSoilContext(`${fakeSoil} (${fakeSoil < 300 ? 'dry' : fakeSoil > 600 ? 'wet' : 'moderate'})`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const aiResponse = await askFarmerQuestion(input, weatherContext, soilContext);
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: aiResponse, sender: 'ai' }]);
    setLoading(false);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.aiRow]}>
      {item.sender === 'ai' && <Icon name="robot" size={24} color="#4CAF50" style={styles.avatar} />}
      <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={item.sender === 'user' ? styles.userText : styles.aiText}>{item.text}</Text>
      </View>
      {item.sender === 'user' && <Icon name="account" size={24} color="#2196F3" style={styles.avatar} />}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Icon name="robot" size={28} color="#FFF" />
        <Text style={styles.headerTitle}>AI Farming Assistant</Text>
      </LinearGradient>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about crops, weather, irrigation..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Icon name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },
  chatList: { padding: 16, paddingBottom: 80 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  avatar: { marginHorizontal: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 20 },
  userBubble: { backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#E0E0E0', borderBottomLeftRadius: 4 },
  userText: { color: '#FFF', fontSize: 16 },
  aiText: { color: '#000', fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#DDD' },
  input: { flex: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, maxHeight: 80 },
  sendButton: { backgroundColor: '#4CAF50', borderRadius: 30, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  loader: { position: 'absolute', bottom: 80, alignSelf: 'center' },
});