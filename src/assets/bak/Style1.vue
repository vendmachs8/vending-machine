<template>
    <div class="min-h-screen flex items-center justify-center">
      <div class="w-[90%] max-w-sm grid grid-cols-2 gap-x-4 gap-y-2">
        <!-- Loop untuk membuat 12 product cards (2x6) -->
        <div
          v-for="(product, index) in products"
          :key="index"
          class="w-48 mx-auto rounded-2xl shadow-lg overflow-hidden "
        >
          <!-- Colored Square Representing the Image -->
          <div class="relative h-44 flex item-stretch mx-2 my-2">
            <!-- Persegi berwarna untuk memvisualkan gambar -->
            <div class="self-end w-full h-[72%] bg-beige rounded-3xl" />
            <div class="absolute w-[72%] h-[50%] bg-beige rounded-t-3xl rounded-br-2xl" />
            <!-- Overlay Plus Button with White Background -->
            <div class="absolute top-0 right-0 p-2">
              <Button
                icon="pi pi-plus"
                class="bg-lime-green text-black rounded-full p-2 hover:bg-yellow border-none"
                @click="addToCart(index)"
              />
            </div>
          </div>
  
          <!-- Product Details -->
          <div class="mx-2 my-2 mb-4">
            <h3 class="text-black text-lg font-light">{{ product.name }}</h3>
            <p class="text-black font-semibold">{{ product.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Button from 'primevue/button';
  
  export default {
    components: {
      Button,
    },
    data() {
      return {
        // Data dummy untuk 12 produk (2x6)
        products: Array(12).fill({
          name: 'Organic Banana',
          price: '$4.99',
        }),
      };
    },
    methods: {
      addToCart(index) {
        // Logika untuk menambahkan produk ke keranjang
        console.log(`Added ${this.products[index].name} to cart!`);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Custom Colors berdasarkan gambar */
  .bg-beige {
    background-color: #f5e8c7; /* Beige background */
  }
  .text-beige {
    color: #f5e8c7; /* Beige text */
  }
  .bg-lime-green {
    background-color: #a3e635; /* Lime green untuk tombol */
  }
  .bg-yellow {
    background-color: #ffc107; /* Kuning pisang */
  }
  .text-black {
    color: #000000; /* Teks hitam */
  }
  
  /* Styling tambahan untuk tombol */
  .pi-plus {
    font-size: 1rem; /* Ukuran ikon plus */
  }
  
  /* Menghapus padding default PrimeVue Button */
  button.p-button {
    padding: 0; /* Menghapus padding default */
    width: 2rem; /* Ukuran tombol */
    height: 2rem; /* Ukuran tombol */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Menyesuaikan ukuran ikon */
  button.p-button .pi {
    font-size: 1rem;
  }
  </style>