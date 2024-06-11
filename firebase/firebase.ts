// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKZtOMo3aDGy-EzIZPmnVUh5jOv0f6cio",
  authDomain: "upload-79a0b.firebaseapp.com",
  projectId: "upload-79a0b",
  storageBucket: "upload-79a0b.appspot.com",
  messagingSenderId: "766016582835",
  appId: "1:766016582835:web:b3ac4141894a7db50b6cc6"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const messaging = getMessaging(app)
export {auth , firestore, app,storage,messaging,getToken,onMessage};