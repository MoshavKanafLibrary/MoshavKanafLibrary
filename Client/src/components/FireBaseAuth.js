// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmOPl5T6NZU_uuLpf923LWlUd-3VQ-CZ8",
  authDomain: "library-eae50.firebaseapp.com",
  databaseURL: "https://library-eae50-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "library-eae50",
  storageBucket: "library-eae50.appspot.com",
  messagingSenderId: "147258996344",
  appId: "1:147258996344:web:2a4a3e23e7f9327f309f8d",
  measurementId: "G-CKZ548XRFZ"
};


  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export Firestore