// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAntV01xlIiHUP1iwTOi2KafH5ORNrQZZs",
  authDomain: "vending-machine-d7e2e.firebaseapp.com",
  databaseURL: "https://vending-machine-d7e2e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vending-machine-d7e2e",
  storageBucket: "vending-machine-d7e2e.firebasestorage.app",
  messagingSenderId: "792497055844",
  appId: "1:792497055844:web:4056d652f527338bd29771",
  measurementId: "G-RZHX27SYMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
