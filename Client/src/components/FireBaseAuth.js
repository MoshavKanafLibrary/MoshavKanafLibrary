// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByaDx4DndDizE4OoSlJUZaZ-J8cLIw2o4",
  authDomain: "moshavkanaflib-40ff5.firebaseapp.com",
  projectId: "moshavkanaflib-40ff5",
  storageBucket: "moshavkanaflib-40ff5.appspot.com",
  messagingSenderId: "749702864605",
  appId: "1:749702864605:web:7a175341bdd48b9fd00534",
  measurementId: "G-8BNEWE1E8X"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export Firestore