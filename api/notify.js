import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, set, get } from 'firebase/database';

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
    console.log('Notify received - Body:', req.body);
    const { trx_id, status, reference_id, sid } = req.body;

    if (!reference_id && !sid) {
      return res.status(400).send('Missing reference_id or sid');
    }

    const transactionKey = reference_id || sid;
    const transactionRef = dbRef(db, `transactions/${transactionKey}`);

    const snapshot = await get(transactionRef);
    if (!snapshot.exists()) {
      console.log(`Transaction not found for key: ${transactionKey}`);
      return res.status(404).send('Transaction not found');
    }

    await set(transactionRef, {
      ...snapshot.val(),
      trx_id: trx_id || sid,
      status,
      updatedAt: new Date().toISOString(),
      paymentData: req.body,
    });

    console.log(`Transaction ${transactionKey} updated to status: ${status}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in notify:', error);
    res.status(500).send('Internal Server Error');
  }
}