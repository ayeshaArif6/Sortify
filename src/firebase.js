import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBjQvP9DLY5f_r6hoiOcWFe0Yyl4GbgbG0",
    authDomain: "card-champ.firebaseapp.com",
    projectId: "card-champ",
    storageBucket: "card-champ.firebasestorage.app",
    messagingSenderId: "729376722157",
    appId: "1:729376722157:web:f514a1fb40f67ba93bd0e4",
    measurementId: "G-XW1WP63L85"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
