import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, get, set } from 'firebase/database';

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
    console.log('Starting receipt reset process...');
    const pendingOrdersRef = dbRef(db, 'pendingOrders');
    const snapshot = await get(pendingOrdersRef);
    const pendingOrdersData = snapshot.val();

    if (!pendingOrdersData) {
      console.log('No receipts found in pendingOrders.');
      return res.status(404).json({ message: 'No receipts found to reset' });
    }

    const receiptCount = Object.keys(pendingOrdersData).length;
    await set(pendingOrdersRef, null);

    console.log(`Reset ${receiptCount} receipts successfully`);
    res.status(200).json({ message: 'All receipts have been reset', resetCount: receiptCount });
  } catch (error) {
    console.error('Error resetting receipts:', error);
    res.status(500).json({ error: 'Failed to reset receipts', details: error.message });
  }
}