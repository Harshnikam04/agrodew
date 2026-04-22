import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGiuYmUWuDrTHSdrIxrVjpi_FYQcq0l6g",
  authDomain: "agrodew-95e36.firebaseapp.com",
  databaseURL: "https://agrodew-95e36-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agrodew-95e36",
  storageBucket: "agrodew-95e36.firebasestorage.app",
  messagingSenderId: "445776847837",
  appId: "1:445776847837:web:7a6d4d1b1762b0aeb68c34"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);