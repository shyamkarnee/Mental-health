import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG9Wtw7nbPvsd6dZkP8opgACt_TSUeVpw",
  authDomain: "ai-project-e6cb2.firebaseapp.com",
  projectId: "ai-project-e6cb2",
  storageBucket: "ai-project-e6cb2.firebasestorage.app",
  messagingSenderId: "744153354445",
  appId: "1:744153354445:web:030b8357ea0d3a2dabd984",
  measurementId: "G-FNXC6SD1TX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
