import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBjoidd5OWCRLEJx3fc1qVEA8Yv_9CP3QM",
  authDomain: "folios-imss.firebaseapp.com",
  projectId: "folios-imss",
  storageBucket: "folios-imss.firebasestorage.app",
  messagingSenderId: "503603285610",
  appId: "1:503603285610:web:eb0b738b6814f3b372c413"
};

const isFirebaseConfigured = true;

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { auth, db, isFirebaseConfigured, signInAnonymously };
