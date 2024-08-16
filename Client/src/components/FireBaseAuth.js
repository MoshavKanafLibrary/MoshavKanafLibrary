// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtIIl1TYhXig2JM9K9KKTPXfLPI7rIkcs",
  authDomain: "lib-moshavkanaf.firebaseapp.com",
  projectId: "lib-moshavkanaf",
  storageBucket: "lib-moshavkanaf.appspot.com",
  messagingSenderId: "25824000957",
  appId: "1:25824000957:web:361d8d1512bb3dbb0030d4",
  measurementId: "G-P4RSY4HQZ4"
};



  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export Firestore