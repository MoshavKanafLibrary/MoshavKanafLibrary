import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);


  

export { db } ; 