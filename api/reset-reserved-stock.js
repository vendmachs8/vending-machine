import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';

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
    const productsSnapshot = await get(dbRef(db, 'products'));
    const productsData = productsSnapshot.val() || {};

    for (const [id, product] of Object.entries(productsData)) {
      if (product.reservedStock > 0) {
        const productRef = dbRef(db, `products/${id}`);
        await update(productRef, { reservedStock: 0 });
      }
    }

    console.log('All reserved stock reset');
    res.status(200).json({ message: 'Reserved stock reset successfully' });
  } catch (error) {
    console.error('Error resetting reserved stock:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}