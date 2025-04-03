import express from 'express';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';

const app = express();
const port = 3000;

const transactions = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FRONTEND_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001' 
  : 'http://192.168.1.27:5001';

const allowedOrigins = [
  FRONTEND_BASE_URL,
  'https://vendmach-vendmachs8s-projects.vercel.app/',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

const apikey = "SANDBOX68C625FF-B529-42C0-B4A7-CC272B85C87D";
const va = "0000001026347048";
const directUrl = 'https://sandbox.ipaymu.com/api/v2/payment/direct';
const paymentPageUrl = 'https://sandbox.ipaymu.com/api/v2/payment';

// Konfigurasi Firebase (ganti dengan konfigurasi Anda)
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
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

app.post('/api/ipaymu-payment', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { buyerName, buyerPhone, buyerEmail, total, paymentMethod, paymentChannel, products, quantities, prices } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const clientReferenceId = `ORDER-${Date.now()}`;
    let body;
    let targetUrl;

    // Validasi stok sebelum melanjutkan
    const productQuantities = products.map((name, index) => ({
      name,
      quantity: parseInt(quantities[index], 10)
    }));

    // Ambil stok dari Firebase
    const productsSnapshot = await get(dbRef(db, 'products'));
    const productsData = productsSnapshot.val() || {};
    const productsList = Object.entries(productsData).map(([id, data]) => ({ id, ...data }));

    for (const { name, quantity } of productQuantities) {
      const product = productsList.find(p => p.name === name);
      if (!product) {
        return res.status(400).json({ error: `Product ${name} not found` });
      }
      const availableStock = product.stock - (product.reservedStock || 0);
      if (availableStock < quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${name}. Available: ${availableStock}` });
      }
    }

    // Kunci stok sementara
    for (const { name, quantity } of productQuantities) {
      const product = productsList.find(p => p.name === name);
      const productRef = dbRef(db, `products/${product.id}`);
      await update(productRef, {
        reservedStock: (product.reservedStock || 0) + quantity
      });
    }

    // Siapkan data pembayaran
    if (paymentMethod === 'payment_page') {
      body = {
        product: products || ["Product"],
        qty: quantities || ["1"],
        price: prices || [total.toString()],
        amount: total.toString(),
        returnUrl: `${FRONTEND_BASE_URL}/api/notify`,
        cancelUrl: `${FRONTEND_BASE_URL}/api/notify`,
        notifyUrl: "https://d750-114-10-46-80.ngrok-free.app/api/notify",
        referenceId: clientReferenceId,
        buyerName: buyerName || "Customer Name",
        buyerPhone: buyerPhone || "08123456789",
        buyerEmail: buyerEmail || "customer@mail.com"
      };
      targetUrl = paymentPageUrl;
    } else {
      if (paymentMethod === 'va' && !paymentChannel) {
        return res.status(400).json({ error: 'Payment channel is required for VA' });
      }
      body = {
        name: buyerName || "Customer Name",
        phone: buyerPhone || "08123456789",
        email: buyerEmail || "customer@mail.com",
        amount: total.toString(),
        notifyUrl: "https://d750-114-10-46-80.ngrok-free.app/api/notify",
        referenceId: clientReferenceId,
        paymentMethod: paymentMethod,
        paymentChannel: paymentMethod === 'va' ? paymentChannel : (paymentMethod === 'qris' ? 'mpm' : null),
        expired: "24",
        comments: "Pembayaran untuk pesanan di toko online"
      };
      targetUrl = directUrl;
    }

    console.log('Final request body being sent to iPaymu:', body);

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
      const serverReferenceId = responseJson.Data.ReferenceId || responseJson.Data.SessionID;
      transactions[serverReferenceId] = {
        status: 'pending',
        transactionId: responseJson.Data.TransactionId || serverReferenceId,
        referenceId: serverReferenceId,
        clientReferenceId: clientReferenceId,
        paymentMethod: paymentMethod,
        paymentChannel: paymentMethod === 'va' ? paymentChannel : (paymentMethod === 'qris' ? 'mpm' : null),
        reservedItems: productQuantities // Simpan item yang dikunci
      };

      res.json({
        ...responseJson,
        clientReferenceId: clientReferenceId,
        Data: {
          ...responseJson.Data,
          ReferenceId: serverReferenceId,
          PaymentNo: responseJson.Data.PaymentNo,
          Url: responseJson.Data.Url || responseJson.Data.PaymentUrl,
          QrUrl: responseJson.Data.QrUrl || responseJson.Data.QRUrl,
        },
      });
    } else {
      // Kembalikan stok sementara jika gagal
      for (const { name, quantity } of productQuantities) {
        const product = productsList.find(p => p.name === name);
        const productRef = dbRef(db, `products/${product.id}`);
        await update(productRef, {
          reservedStock: Math.max((product.reservedStock || 0) - quantity, 0)
        });
      }
      console.log(`Failed to initialize transaction: ${responseJson.Message}`);
      res.status(400).json(responseJson);
    }
  } catch (error) {
    console.error('Error in /api/ipaymu-payment:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint lainnya tetap sama (tambahkan impor db jika diperlukan)
app.post('/api/notify', async (req, res) => {
  try {
    console.log('Notify received - Body:', req.body);
    const { trx_id, status, reference_id, sid } = req.body;

    if (!reference_id) {
      return res.status(400).send('Missing reference_id');
    }

    let transactionKey = reference_id;
    if (!transactions[transactionKey]) {
      transactionKey = sid;
    }

    if (transactions[transactionKey]) {
      transactions[transactionKey] = {
        ...transactions[transactionKey],
        trx_id: trx_id || sid,
        status: status,
        updatedAt: new Date().toISOString(),
        paymentData: req.body
      };
      console.log(`Transaction ${transactionKey} updated to status: ${status}`);

      if (status === 'berhasil') {
        const reservedItems = transactions[transactionKey].reservedItems || [];
        const productsSnapshot = await get(dbRef(db, 'products'));
        const productsData = productsSnapshot.val() || {};
        const productsList = Object.entries(productsData).map(([id, data]) => ({ id, ...data }));

        for (const { name, quantity } of reservedItems) {
          const product = productsList.find(p => p.name === name);
          if (product) {
            const productRef = dbRef(db, `products/${product.id}`);
            const newStock = product.stock - quantity;
            const newReservedStock = Math.max((product.reservedStock || 0) - quantity, 0);
            await update(productRef, {
              stock: newStock >= 0 ? newStock : 0,
              reservedStock: newReservedStock
            });
          }
        }
        console.log('Payment successful, transaction details:', req.body);
      }
    } else {
      console.log(`Transaction not found for reference_id: ${reference_id} or sid: ${sid}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in notify:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/check-transaction', async (req, res) => {
  try {
    const { referenceId } = req.body;
    if (!referenceId) {
      return res.status(400).json({ error: 'referenceId is required' });
    }

    const transaction = transactions[referenceId];
    if (!transaction) {
      const matchingTransaction = Object.values(transactions).find(t => t.clientReferenceId === referenceId);
      if (matchingTransaction) {
        return res.json({
          status: matchingTransaction.status,
          transactionId: matchingTransaction.trx_id || matchingTransaction.transactionId,
          paymentData: matchingTransaction.paymentData,
        });
      }
      return res.status(404).json({
        status: 'not_found',
        message: 'Transaction not found',
      });
    }

    res.json({
      status: transaction.status,
      transactionId: transaction.trx_id || transaction.transactionId,
      paymentData: transaction.paymentData
    });
  } catch (error) {
    console.error('Error in check-transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/cancel-transaction', async (req, res) => {
  try {
    const { referenceId } = req.body;
    console.log('Received cancellation request for referenceId:', referenceId); // Log untuk debug

    if (!referenceId) {
      console.log('No referenceId provided in cancellation request');
      return res.status(400).json({ error: 'referenceId is required' });
    }

    const transaction = transactions[referenceId];
    if (!transaction) {
      console.log(`Transaction not found for referenceId: ${referenceId}`);
      // Cari berdasarkan clientReferenceId sebagai cadangan
      const matchingTransaction = Object.values(transactions).find(t => t.clientReferenceId === referenceId);
      if (!matchingTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      // Gunakan matchingTransaction jika ditemukan
      transactions[matchingTransaction.referenceId].status = 'cancelled';
      console.log(`Transaction ${matchingTransaction.referenceId} cancelled by user (matched by clientReferenceId)`);

      const reservedItems = matchingTransaction.reservedItems || [];
      const productsSnapshot = await get(dbRef(db, 'products'));
      const productsData = productsSnapshot.val() || {};
      const productsList = Object.entries(productsData).map(([id, data]) => ({ id, ...data }));

      for (const { name, quantity } of reservedItems) {
        const product = productsList.find(p => p.name === name);
        if (product) {
          const productRef = dbRef(db, `products/${product.id}`);
          const currentReservedStock = product.reservedStock || 0;
          const newReservedStock = Math.max(currentReservedStock - quantity, 0);
          console.log(`Releasing ${quantity} reserved stock for ${name}. New reservedStock: ${newReservedStock}`);
          await update(productRef, {
            reservedStock: newReservedStock
          });
        } else {
          console.warn(`Product ${name} not found in database during cancellation`);
        }
      }

      res.status(200).json({ 
        message: 'Transaction cancelled',
        status: 'cancelled',
        referenceId: matchingTransaction.referenceId
      });
      return;
    }

    // Jika transaksi ditemukan langsung dengan referenceId
    transactions[referenceId].status = 'cancelled';
    console.log(`Transaction ${referenceId} cancelled by user`);

    const reservedItems = transaction.reservedItems || [];
    const productsSnapshot = await get(dbRef(db, 'products'));
    const productsData = productsSnapshot.val() || {};
    const productsList = Object.entries(productsData).map(([id, data]) => ({ id, ...data }));

    for (const { name, quantity } of reservedItems) {
      const product = productsList.find(p => p.name === name);
      if (product) {
        const productRef = dbRef(db, `products/${product.id}`);
        const currentReservedStock = product.reservedStock || 0;
        const newReservedStock = Math.max(currentReservedStock - quantity, 0);
        console.log(`Releasing ${quantity} reserved stock for ${name}. New reservedStock: ${newReservedStock}`);
        await update(productRef, {
          reservedStock: newReservedStock
        });
      } else {
        console.warn(`Product ${name} not found in database during cancellation`);
      }
    }

    res.status(200).json({ 
      message: 'Transaction cancelled',
      status: 'cancelled',
      referenceId: referenceId
    });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});