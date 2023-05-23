import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC3Q-r3IK4koRJDauAMfL0c9y9rYPw1_eU",
  authDomain: "cs-share-97926.firebaseapp.com",
  projectId: "cs-share-97926",
  storageBucket: "cs-share-97926.appspot.com",
  messagingSenderId: "404670908574",
  appId: "1:404670908574:web:bbd95c2c43331e0b37538f",
  measurementId: "G-DGWP4DP545"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const storage = getStorage(app); 

export const db = getFirestore(app);
const analytics = getAnalytics(app);
