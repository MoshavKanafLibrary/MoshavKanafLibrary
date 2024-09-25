import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);


  

export { db } ; 
