import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
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

const apikey = "SANDBOX68C625FF-B529-42C0-B4A7-CC272B85C87D";
const va = "0000001026347048";
const directUrl = 'https://sandbox.ipaymu.com/api/v2/payment/direct';
const paymentPageUrl = 'https://sandbox.ipaymu.com/api/v2/payment';

// ... (impor dan konfigurasi sama)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { buyerName, buyerPhone, buyerEmail, total, paymentMethod, paymentChannel, products, quantities, prices } = req.body;

    if (!paymentMethod || !total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    const clientReferenceId = `ORDER-${Date.now()}`;
    let body;
    let targetUrl;

    const productQuantities = products.map((name, index) => ({
      name,
      quantity: parseInt(quantities[index], 10)
    }));

    const productsSnapshot = await get(dbRef(db, 'products'));
    const productsData = productsSnapshot.val() || {};
    const productsList = Object.entries(productsData).map(([id, data]) => ({ id, ...data }));

    for (const { name, quantity } of productQuantities) {
      const product = productsList.find(p => p.name === name);
      if (!product || (product.stock - (product.reservedStock || 0)) < quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${name}` });
      }
    }

    for (const { name, quantity } of productQuantities) {
      const product = productsList.find(p => p.name === name);
      const productRef = dbRef(db, `products/${product.id}`);
      await update(productRef, { reservedStock: (product.reservedStock || 0) + quantity });
    }

    if (paymentMethod === 'payment_page') {
      body = {
        product: products,
        qty: quantities,
        price: prices,
        amount: total.toString(),
        returnUrl: 'https://vendmach-vendmachs8s-projects.vercel.app/api/notify',
        cancelUrl: 'https://vendmach-vendmachs8s-projects.vercel.app/api/notify',
        notifyUrl: 'https://vendmach-vendmachs8s-projects.vercel.app/api/notify',
        referenceId: clientReferenceId,
        buyerName,
        buyerPhone,
        buyerEmail
      };
      targetUrl = paymentPageUrl;
    } else {
      body = {
        name: buyerName,
        phone: buyerPhone,
        email: buyerEmail,
        amount: total.toString(),
        notifyUrl: 'https://vendmach-vendmachs8s-projects.vercel.app/api/notify',
        referenceId: clientReferenceId,
        paymentMethod,
        paymentChannel,
        expired: "24",
        comments: "Pembayaran untuk pesanan di toko online"
      };
      targetUrl = directUrl;
    }

    const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
    const stringtosign = "POST:" + va + ":" + bodyEncrypt + ":" + apikey;
    const signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringtosign, apikey));
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'va': va,
        'signature': signature,
        'timestamp': timestamp
      },
      body: JSON.stringify(body)
    });

    const responseJson = await response.json();
    console.log('iPaymu response:', responseJson);

    if (responseJson.Status === 200) {
      const serverReferenceId = responseJson.Data.SessionId || responseJson.Data.ReferenceId || clientReferenceId;
      await set(dbRef(db, `transactions/${serverReferenceId}`), {
        status: 'pending',
        transactionId: responseJson.Data.TransactionId || serverReferenceId,
        referenceId: serverReferenceId,
        clientReferenceId,
        paymentMethod,
        paymentChannel,
        reservedItems: productQuantities,
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({
        ...responseJson,
        clientReferenceId,
        Data: {
          ...responseJson.Data,
          ReferenceId: serverReferenceId,
        }
      });
    } else {
      res.status(400).json(responseJson);
    }
  } catch (error) {
    console.error('Error in ipaymu-payment:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}