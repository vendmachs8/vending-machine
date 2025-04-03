import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDrrszF9LAB6LGCKp3c4i1z2Xb-5ZVGsQ0",
  authDomain: "absensi-s8-malang.firebaseapp.com",
  databaseURL: "https://absensi-s8-malang-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-s8-malang",
  storageBucket: "absensi-s8-malang.appspot.com",
  messagingSenderId: "87469885450",
  appId: "1:87469885450:web:4ab09e00028d4c06fc37f3",
  measurementId: "G-3CCXRFHQH0",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const receiptData = req.body;
    console.log('Received receipt data to save:', receiptData);

    const { receiptNumber } = receiptData;
    if (!receiptNumber) {
      return res.status(400).json({ error: 'Receipt number is required' });
    }

    const receiptRef = dbRef(db, `pendingOrders/${receiptNumber}`);
    await set(receiptRef, {
      ...receiptData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    console.log(`Receipt ${receiptNumber} saved successfully`);
    res.status(200).json({ message: 'Receipt saved successfully', receiptNumber });
  } catch (error) {
    console.error('Error saving receipt:', error);
    res.status(500).json({ error: 'Failed to save receipt', details: error.message });
  }
}