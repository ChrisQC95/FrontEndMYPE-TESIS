import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCc9K3tjIXc8P7TMNP7mnVmKxHaJqrF8fc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tesis-erp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tesis-erp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tesis-erp.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "595833055819",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:595833055819:web:6dce25f11b0f2971b4fbce",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EZP0ZG5S6G"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
