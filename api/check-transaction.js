import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

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
    const { referenceId } = req.body;
    if (!referenceId) {
      return res.status(400).json({ error: 'Reference ID is required' });
    }

    const transactionRef = dbRef(db, `transactions/${referenceId}`);
    const snapshot = await get(transactionRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = snapshot.val();
    console.log(`Transaction status for ${referenceId}: ${transaction.status}`);

    res.status(200).json({
      status: transaction.status,
      transactionId: transaction.trx_id || referenceId,
    });
  } catch (error) {
    console.error('Error checking transaction:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}