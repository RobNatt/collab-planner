import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl85Bm9CVyNbhf2UrsX1qUxTPsPHPa3uY",
  authDomain: "collab-planner-757e3.firebaseapp.com",
  projectId: "collab-planner-757e3",
  storageBucket: "collab-planner-757e3.firebasestorage.app",
  messagingSenderId: "892585668643",
  appId: "1:892585668643:web:20465e17c9f803de2a0196"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);