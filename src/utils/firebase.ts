// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGDuQ6ZeamZTtHqtPFwctP4lPH7owLe3c",
  authDomain: "andy-toystory-firebase.firebaseapp.com",
  projectId: "andy-toystory-firebase",
  storageBucket: "andy-toystory-firebase.firebasestorage.app",
  messagingSenderId: "835290523592",
  appId: "1:835290523592:web:3fb3b9de76ee254afa42fd"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export { auth, googleProvider, db };