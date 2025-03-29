<template>
    <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
        <h1 class="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p class="text-gray-600 mb-6">Thank you for your purchase.</p>
        
        <div v-if="paymentDetails" class="text-left mb-6">
          <p><span class="font-semibold">Order ID:</span> {{ paymentDetails.referenceId }}</p>
          <p><span class="font-semibold">Amount:</span> Rp{{ paymentDetails.amount }}</p>
          <p><span class="font-semibold">Payment Method:</span> {{ paymentDetails.paymentMethod }}</p>
        </div>
  
        <button 
            @click="goToHome"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition"
            >
            Back to Home
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const router = useRouter();
      const paymentDetails = ref(null);
  
      onMounted(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const referenceId = queryParams.get('reference_id');
        
        if (referenceId) {
          // Fetch payment details from server or local storage
          fetchPaymentDetails(referenceId);
        }

        if (window.opener) {
            // Kirim pesan ke tab utama sebelum menutup
            window.addEventListener('beforeunload', () => {
            window.opener.postMessage({ type: 'payment_completed', status: 'success' }, '*');
            });
        }

      });
  
      const fetchPaymentDetails = async (referenceId) => {
        try {
          const response = await fetch(`http://localhost:3000/api/check-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referenceId })
          });
          const data = await response.json();
          
          if (data.status === 'berhasil') {
            paymentDetails.value = {
              referenceId,
              amount: localStorage.getItem('lastPaymentAmount'),
              paymentMethod: data.paymentMethod === 'payment_page' ? 'iPaymu Payment Page' : 
                           data.paymentMethod === 'va' ? `VA ${data.paymentChannel.toUpperCase()}` : 'QRIS'
            };
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
  
      const goToHome = () => {
        // Cek apakah ini dibuka dari redirect iPaymu
        const queryParams = new URLSearchParams(window.location.search);
        const isReturn = queryParams.get('return') === 'true';
        
        if (isReturn) {
            // Tutup tab ini dan kembali ke tab utama
            window.opener.postMessage({ type: 'payment_completed', status: 'success' }, '*');
            window.close();
        } else {
            // Navigasi normal jika bukan dari redirect
            router.push('/');
        }
    };
  
      return { paymentDetails, goToHome };
    }
  };
  </script>