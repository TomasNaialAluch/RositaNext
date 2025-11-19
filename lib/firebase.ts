// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

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
const apps = getApps()
const app: FirebaseApp = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0]

let analytics: Analytics | null = null;
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configurar el proveedor de Google para mejor compatibilidad
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db, storage, googleProvider };

