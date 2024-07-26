// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJh5TTu3aot-bINnyrEbMpmCN7QY3UF_E",
  authDomain: "moshavkanaf-a8e03.firebaseapp.com",
  databaseURL: "https://moshavkanaf-a8e03-default-rtdb.firebaseio.com",
  projectId: "moshavkanaf-a8e03",
  storageBucket: "moshavkanaf-a8e03.appspot.com",
  messagingSenderId: "565628714410",
  appId: "1:565628714410:web:df389145d40adf099ebfd3",
  measurementId: "G-X0FCSY15HD"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export Firestore