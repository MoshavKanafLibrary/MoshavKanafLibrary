import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);


  

export { db } ; 