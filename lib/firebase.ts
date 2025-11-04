// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdilgyg87D9pDIM1Gvs-H5DqtfbTpC3ys",
  authDomain: "rosita-b76eb.firebaseapp.com",
  projectId: "rosita-b76eb",
  storageBucket: "rosita-b76eb.firebasestorage.app",
  messagingSenderId: "778473943709",
  appId: "1:778473943709:web:a44d114c61ab7456f99a74",
  measurementId: "G-JHC9CKT0BS"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined') {
  // Solo inicializar en el cliente
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    analytics = getAnalytics(app);
    auth = getAuth(app);
  }
} else {
  // En el servidor, solo inicializar la app sin analytics
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

export { app, analytics, auth, googleProvider };

