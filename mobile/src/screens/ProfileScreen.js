import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, ActivityIndicator
} from 'react-native';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState({ name: '', email: '', gsmNumber: '' });
  const [editing, setEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData({
          name: userDoc.data().name || '',
          email: user.email,
          gsmNumber: userDoc.data().gsmNumber || '',
        });
      } else {
        setUserData({ name: '', email: user.email, gsmNumber: '' });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        gsmNumber: userData.gsmNumber,
      });
      Alert.alert('Success', 'Profile updated');
      setEditing(false);
      // Reload data to reflect changes
      loadUserData();
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await signOut(auth);
          navigation.replace('Login');
        },
      },
    ]);
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
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Icon name="account-circle" size={80} color="#FFF" />
        <Text style={styles.userName}>{userData.name || 'Farmer'}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {editing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="SIM900A Phone Number (e.g., +919876543210)"
              value={userData.gsmNumber}
              onChangeText={(text) => setUserData({ ...userData, gsmNumber: text })}
              keyboardType="phone-pad"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditing(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Icon name="card-account-details" size={24} color="#666" />
              <Text style={styles.infoText}>Name: {userData.name || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="cellphone" size={24} color="#666" />
              <Text style={styles.infoText}>GSM Number: {userData.gsmNumber || 'Not set'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingRow}>
          <Text>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.settingRow}>
          <Text>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 10 },
  userEmail: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  section: { backgroundColor: '#FFF', margin: 16, padding: 16, borderRadius: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, marginLeft: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#F44336' },
  editButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  editButtonText: { color: '#FFF', fontWeight: 'bold' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  logoutButton: { flexDirection: 'row', backgroundColor: '#F44336', margin: 16, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
});