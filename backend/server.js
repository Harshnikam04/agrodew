const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

// Initialize Firebase using the JSON file
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Agrodew Backend with Firebase is running!');
});

// Endpoint to receive sensor data from Arduino
app.post('/api/devices/sensor-data', async (req, res) => {
  try {
    const { deviceId, temperature, humidity, soilMoisture, waterLevel, aqi } = req.body;
    
    // Find which farm this device belongs to
    const farmsSnapshot = await db.collection('farms').where('deviceId', '==', deviceId).get();
    
    if (farmsSnapshot.empty) {
      return res.status(404).json({ error: 'Device not registered' });
    }
    
    const farmId = farmsSnapshot.docs[0].id;
    
    // Save sensor reading
    await db.collection('farms').doc(farmId).collection('sensors').add({
      temperature,
      humidity,
      soilMoisture,
      waterLevel,
      aqi,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));