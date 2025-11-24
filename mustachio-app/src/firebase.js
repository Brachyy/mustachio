import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Changed to Realtime Database as per user rules

const firebaseConfig = {
  apiKey: "AIzaSyDiellP6ugT7pvDfQ9Oari6wrZCALkPUk4",
  authDomain: "mustachio-91bf0.firebaseapp.com",
  databaseURL: "https://mustachio-91bf0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mustachio-91bf0",
  storageBucket: "mustachio-91bf0.firebasestorage.app",
  messagingSenderId: "572931599336",
  appId: "1:572931599336:web:4bafa82b51d58b52c9125d",
  measurementId: "G-SXXJZJTWLQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app); // Export Realtime Database instance
export default app;
