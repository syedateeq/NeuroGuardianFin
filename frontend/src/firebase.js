// Firebase SDK initialization for NeuroGuardianFin
// Plan: Spark (Free) — Firestore only, NO Storage
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAx0cMUNOfOmzRxWLYQA_Uv3NvQqmog5CU",
  authDomain: "neuroguardianfin.firebaseapp.com",
  projectId: "neuroguardianfin",
  storageBucket: "neuroguardianfin.firebasestorage.app",
  messagingSenderId: "756194512689",
  appId: "1:756194512689:web:9f95802817613972336a10",
  measurementId: "G-KCY1QD3145"
};

// Initialize Firebase app (singleton)
const app = initializeApp(firebaseConfig);

// Initialize and export Firestore instance
export const db = getFirestore(app);

export default app;
