import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);


  

export { db } ; 