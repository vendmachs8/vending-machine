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
  apiKey: "AIzaSyDrrszF9LAB6LGCKp3c4i1z2Xb-5ZVGsQ0",
  authDomain: "absensi-s8-malang.firebaseapp.com",
  databaseURL:
    "https://absensi-s8-malang-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-s8-malang",
  storageBucket: "absensi-s8-malang.appspot.com",
  messagingSenderId: "87469885450",
  appId: "1:87469885450:web:4ab09e00028d4c06fc37f3",
  measurementId: "G-3CCXRFHQH0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
