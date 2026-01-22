import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    // appId: import.meta.env.VITE_FIREBASE_APP_ID,
    apiKey: "AIzaSyAMYFQeR-nSXC5TrC1_EG8O1dvV72grdPk",
    authDomain: "gatheringfun-9f90b.firebaseapp.com",
    projectId: "gatheringfun-9f90b",
    storageBucket: "gatheringfun-9f90b.firebasestorage.app",
    messagingSenderId: "127856246038",
    appId: "1:127856246038:web:15ccb418ad1828eff2e437",
    measurementId: "G-3L2YMD21VG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
