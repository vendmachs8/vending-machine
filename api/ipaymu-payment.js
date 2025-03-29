import { createServer } from 'http';

export default async (req, res) => {
  // Kode dari server.js disini
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method === 'POST') {
    try {
      // Proses pembayaran
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};