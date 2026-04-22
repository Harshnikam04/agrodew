import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as SMS from 'expo-sms';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RelayControlScreen() {
  const [relays, setRelays] = useState([
    { id: 'R1', name: 'Main Motor', status: false },
    { id: 'R2', name: 'Valve 1', status: false },
    { id: 'R3', name: 'Valve 2', status: false },
    { id: 'R4', name: 'Valve 3', status: false },
  ]);
  const [gsmNumber, setGsmNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGsmNumber();
  }, []);

  const loadGsmNumber = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().gsmNumber) {
        setGsmNumber(userDoc.data().gsmNumber);
      } else {
        Alert.alert('Warning', 'No GSM number set. Please update your profile.');
      }
    }
    setLoading(false);
  };

  const sendSmsCommand = async (command) => {
    if (!gsmNumber) {
      Alert.alert('Error', 'No GSM number configured. Go to Profile to set it.');
      return;
    }
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'SMS is not available on this device.');
      return;
    }
    const { result } = await SMS.sendSMSAsync(gsmNumber, command);
    if (result === 'sent') {
      Alert.alert('Success', `Command "${command}" sent.`);
    } else if (result === 'cancelled') {
      // do nothing
    } else {
      Alert.alert('Info', `SMS status: ${result}`);
    }
  };

  const toggleRelay = (relayId, currentStatus) => {
    const action = currentStatus ? 'OFF' : 'ON';
    const command = `${relayId}${action}`;
    Alert.alert(
      'Confirm',
      `Send "${command}" to turn ${action} the relay?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendSmsCommand(command) }
      ]
    );
  };

  const getIcon = (relayId) => {
    const icons = {
      R1: 'water-pump',
      R2: 'sprinkler',
      R3: 'valve',
      R4: 'leaf'
    };
    return icons[relayId] || 'power-plug';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎮 Relay Control (SMS)</Text>
      <Text style={styles.subtitle}>Commands sent via your phone's SMS – works without internet</Text>
      {!gsmNumber && (
        <View style={styles.warningBox}>
          <Icon name="alert-circle" size={24} color="#F44336" />
          <Text style={styles.warningText}>No GSM number found. Please go to Profile and add your SIM900A number.</Text>
        </View>
      )}
      {relays.map((relay) => (
        <View key={relay.id} style={styles.card}>
          <Icon name={getIcon(relay.id)} size={32} color="#4CAF50" />
          <Text style={styles.relayName}>{relay.name}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: relay.status ? '#4CAF50' : '#F44336' }]}
            onPress={() => toggleRelay(relay.id, relay.status)}
          >
            <Text style={styles.buttonText}>{relay.status ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 2 },
  relayName: { flex: 1, fontSize: 18, marginLeft: 15 },
  button: { paddingHorizontal: 25, paddingVertical: 10, borderRadius: 25 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  warningBox: { flexDirection: 'row', backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  warningText: { marginLeft: 8, fontSize: 14, color: '#F44336', flex: 1 },
});