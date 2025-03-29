<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="flex items-center justify-between px-4 py-4">
      <h2 class="subpixel-antialiased font-semibold text-4xl px-2" id="featured-products">
        Home
      </h2>
      <button @click="toggleMenuDrawer">
        <i class="pi pi-list text-xl"></i>
      </button>
    </div>

    <!-- Promotion Card -->
    <div class="card">
      <Carousel
        :value="promos"
        :numVisible="1"
        :numScroll="1"
        :responsiveOptions="responsiveOptions"
        circular
        :autoplayInterval="2000"
        :showNavigators="false"
        :showIndicators="false"
      >
        <template #item="slotProps">
          <div class="aspect-wrapper">
            <div class="relative mx-auto">
              <img
                :src="slotProps.data.image ? slotProps.data.image : productImage"
                :alt="slotProps.data.name"
                class="mx-auto w-[95%] h-50 object-cover aspect-image rounded-xl"
              />
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <!-- Featured Products -->
    <section class="container mx-auto">
      <!-- Sticky Bar with Search and Sort -->
      <div class="sticky top-0 z-50 bg-gray-100">
        <div class="relative py-2 flex flex-col gap-4 mt-2">
          <!-- Search Input -->
          <div class="relative flex items-center justify-between px-4 gap-4">
            <IconField class="flex items-center w-full">
              <InputIcon class="pi pi-search cursor-pointer text-gray-700 scale-150 px-1" />
              <InputText
                ref="searchInput"
                v-model="searchQuery"
                placeholder="  Search Products..."
                class="search-input w-full py-4 rounded-full bg-white border border-gray-300 text-gray-600"
              />
            </IconField>
            <button
              @click="toggleCartDrawer"
              class="w-16 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white relative"
            >
              <i class="pi pi-shopping-cart text-xl"></i>
              <span
                v-if="cartCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-md font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md"
              >{{ cartCount }}</span>
            </button>
          </div>
          <!-- Scrollable Filter Buttons and Sort Button -->
          <div class="flex items-center">
            <div class="relative">
              <button
                @click="toggleSortOption"
                class="sort-button mx-2"
                :class="{ 'extended': isSortExtended }"
              >
                <div v-if="isSortExtended" class="flex items-center justify-between gap-2">
                  <span class="text">Urutkan</span>
                  <i class="pi pi-sort" style="font-size: 1.6rem;"></i>
                </div>
                <div v-else class="flex items-center">
                  <i class="pi pi-sort" style="font-size: 1.6rem;"></i>
                </div>
              </button>
              <ul
                v-if="showSortOptions"
                class="absolute z-50 bg-white border border-gray-50 rounded-3xl shadow-lg mt-2 p-2 w-48"
              >
                <li
                  @click="setSortOption('priceLowToHigh')"
                  class="py-3 px-4 cursor-pointer rounded-full"
                  :class="{ 'bg-primary-200 text-white text-lg text-center': sortBy === 'priceLowToHigh' }"
                >
                  Harga Terendah
                </li>
                <li
                  @click="setSortOption('priceHighToLow')"
                  class="py-3 px-4 cursor-pointer rounded-full"
                  :class="{ 'bg-primary-200 text-white text-lg text-center': sortBy === 'priceHighToLow' }"
                >
                  Harga Tertinggi
                </li>
                <li
                  @click="setSortOption('discountHighToLow')"
                  class="py-3 px-4 cursor-pointer rounded-full"
                  :class="{ 'bg-primary-200 text-white text-lg text-center': sortBy === 'discountHighToLow' }"
                >
                  Diskon Tertinggi
                </li>
              </ul>
            </div>
            <div class="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <button
                @click="selectSort('all')"
                class="flex items-center min-w-36 justify-start py-1 px-3 text-sm font-light rounded-full transition-colors"
                :class="filter === 'all' ? 'food-gradient text-white' : 'bg-white text-gray-700 hover:bg-gray-200'"
              >
                <img src="../assets/icon/all.png" alt="All Icon" class="w-12 h-12 -ml-2 mr-2 rounded-full bg-white" />
                <p class="text-lg">Semua</p>
              </button>
              <button
                @click="selectSort('drink')"
                class="flex items-center min-w-36 justify-start py-1 px-3 text-sm font-light rounded-full transition-colors"
                :class="filter === 'drink' ? 'food-gradient text-white' : 'bg-white text-gray-700 hover:bg-gray-200'"
              >
                <img src="../assets/icon/drink.png" alt="Drink Icon" class="w-12 h-12 -ml-2 mr-2 rounded-full bg-white" />
                <p class="text-lg">Minuman</p>
              </button>
              <button
                @click="selectSort('food')"
                class="flex items-center min-w-36 justify-start py-1 px-3 text-sm font-light rounded-full transition-colors"
                :class="filter === 'food' ? ' text-white food-gradient' : 'bg-white text-gray-700 hover:bg-gray-200'"
              >
                <img src="../assets/icon/food.png" alt="Food Icon" class="w-12 h-12 -ml-2 mr-2 rounded-full bg-white" />
                <p class="text-lg">Makanan</p>
              </button>
              <!-- Dummy Buttons -->
              <button
                class="flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 min-w-[80px]"
              >
                Tombol 1
              </button>
              <button
                class="flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 min-w-[80px]"
              >
                Tombol 2
              </button>
              <button
                class="flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 min-w-[80px]"
              >
                Tombol 3
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mt-2">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="[
            'bg-white relative shadow-grey-500 border-2xl rounded-2xl p-2 flex flex-col max-h-max rainbow-spots',
            { 'opacity-30 shadow-2xl': getAvailableStock(product) === 0 }
          ]"
          @click="openDrawer(product)"
        >
          <div v-if="product.discount > 0" class="absolute top-1 right-1 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
            -{{ product.discount }}%
          </div>
          <div class="flex justify-center items-center">
            <img
              :src="product.image"
              alt="product.name"
              class="transition ease-in-out delay-150 hover:-translate-y-2 hover:scale-125 duration-300 w-38 h-44 object-cover rounded-full mb-2"
            />
          </div>
          <Tag
            :value="product.inventoryStatus"
            :severity="getSeverity(product.inventoryStatus)"
            class="rounded-xl -ml-3 mr-auto justify-start px-4"
            style="border-radius: 0 8px 8px 0"
          />
          <h3 class="text-lg mt-2">{{ product.name }}</h3>
          <div class="flex justify-between items-center mt-2 text-xl">
            <div class="price-container">
              <p v-if="product.discount > 0" class="text-red-600 font-bold">Rp{{ getDiscountedPrice(product) }}</p>
              <p v-if="product.discount > 0" class="text-gray-300 line-through">Rp{{ product.price }}</p>
              <p v-else class="text-gray-600 font-bold md-4">Rp{{ product.price }}</p>
            </div>
            <div>
              <button
                :disabled="getAvailableStock(product) === 0"
                class="text-white px-2 py-1 rounded-xl transition text-sm"
                :class="{
                  'bg-gray-400 cursor-not-allowed': getAvailableStock(product) === 0,
                  'bg-primary-200': getAvailableStock(product) > 0
                }"
                @click.stop="(event) => { animateProductToCart(event, product); addToCart(product); }"
              >
                <i v-if="getAvailableStock(product) > 0" class="pi pi-plus"></i>
                <i v-if="getAvailableStock(product) === 0" class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu Drawer -->
    <Drawer v-model:visible="isMenuDrawerVisible" position="right" style="width: 150px;">
      <template #header>
        <div class="text-2xl font-bold">Menu</div>
      </template>
      <div class="flex flex-col gap-4 text-white text-center">
        <p v-if="loggedInUser" class="text-lg font-semibold mb-1 text-black">
          ID: {{ loggedInUser }}
        </p>
        <button @click="navigateTo('/admin')" class="w-full py-2 px-4 bg-black rounded-full">
          Admin
        </button>
        <button @click="navigateTo('/login')" class="w-full py-2 px-4 bg-black rounded-full">
          Login
        </button>
        <button @click="navigateTo('/status')" class="w-full py-2 px-4 bg-black rounded-full">
          Status
        </button>
      </div>
    </Drawer>

    <!-- Drawer Pop -->
    <Drawer v-model:visible="isDrawerVisible" position="bottom" style="height: auto;">
      <template #header>
        <p></p>
      </template>
      <div v-if="selectedProduct">
        <div class="image-container">
          <img :src="selectedProduct.image" alt="selectedProduct.name" class="product-image" />
        </div>
        <div class="backdrop-blur-lg bg-white px-2 py-6 rounded-3xl">
          <div v-if="selectedProduct" class="text-2xl font-bold">
            {{ selectedProduct.name }}
          </div>
          <div class="mt-2 flex justify-left items-center gap-2">
            <p v-if="selectedProduct.discount > 0" class="text-red-600 font-bold text-2xl">Rp{{ getDiscountedPrice(selectedProduct) }}</p>
            <p v-if="selectedProduct.discount > 0" class="text-gray-500 line-through text-lg">Rp{{ selectedProduct.price }}</p>
            <p v-else class="text-gray-600 font-bold text-2xl">Rp{{ selectedProduct.price }}</p>
          </div>
          <p class="text-md text-gray-500 mt-2">{{ selectedProduct.desc }}</p>
          <p class="text-sm text-gray-500 mt-2">
            Rak: {{ selectedProduct.rak }} | Stok: {{ getAvailableStock(selectedProduct) }}
          </p>
          <button
            :disabled="getAvailableStock(selectedProduct) === 0"
            class="mt-4 text-white px-4 py-4 rounded-full transition w-full -mb-20 checkout-gradient"
            :class="{ 'bg-gray-400 cursor-not-allowed': getAvailableStock(selectedProduct) === 0, 'bg-primary-500': getAvailableStock(selectedProduct) > 0 }"
            @click="(event) => { closeDrawer(); animateProductToCart(event, selectedProduct); addToCart(selectedProduct); }"
          >
            <i class="pi pi-shopping-cart mr-2"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </Drawer>

    <!-- Cart Drawer -->
    <Drawer
      v-model:visible="isCartDrawerVisible"
      position="bottom"
      style="overflow-y: auto; max-height: 85%; height: auto;"
      class="-mb-5"
      @touchmove.passive.stop
      @scroll.stop
    >
      <template #header>
        <div class="text-2xl font-bold">Cart</div>
      </template>
      <div class="p-0">
        <div v-if="cartItems.length > 0">
          <div class="relative overflow-y-auto">
            <!-- Item Cart (tidak diubah) -->
            <div
              v-for="(item, index) in cartItems"
              :key="index"
              class="flex items-center justify-between bg-white max-h-24 w-full rounded-r-2xl overflow-y-clip my-3"
              style="border-top-left-radius: 40px; border-bottom-left-radius: 40px;"
            >
              <img :src="item.product.image" alt="product.name" class="w-28 h-28 object-cover rounded-md" />
              <div class="grid grid-flow-row min-w-24 max-w-24 items-center -ml-4">
                <span class="truncate text-left mx-2">{{ item.product.name }}</span>
                <div class="grid grid-flow-col">
                  <p class="text-left ml-2 text-gray-400">Rak :</p>
                  <p class="text-left mr-8">{{ item.product.rak }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 -ml-8 -mr-4">
                <button
                  class="px-1.5 py-0.5 border rounded-full"
                  :class="{ 'bg-white border-gray-400': getAvailableStock(item.product) > 0, 'bg-red-200': getAvailableStock(item.product) <= 0 }"
                  @click="decreaseQuantity(item)"
                >
                  <i class="pi pi-minus" />
                </button>
                <span v-if="item.quantity < 10">{{ `0${item.quantity}` }}</span>
                <span v-else>{{ item.quantity }}</span>
                <button
                  class="px-1.5 py-0.5 rounded-full"
                  :class="{ 'bg-primary-200': getAvailableStock(item.product) > 0, 'bg-gray-400': getAvailableStock(item.product) <= 0 }"
                  :disabled="getAvailableStock(item.product) <= 0"
                  @click="increaseQuantity(item)"
                >
                  <i class="pi pi-plus" />
                </button>
              </div>
              <div class="mr-6 max-w-14">
                <span v-if="item.product.discount > 0" class="font-bold text-red-600">Rp{{ getDiscountedPrice(item.product) * item.quantity }}</span>
                <span v-if="item.product.discount > 0" class="block text-gray-500 line-through text-sm">Rp{{ item.product.price * item.quantity }}</span>
                <span v-else class="font-bold">Rp{{ item.product.price * item.quantity }}</span>
              </div>
            </div>
          </div>
          <div class="sticky bottom-0 z-50 bg-surface-100 py-4">
            <div class="flex justify-between py-3">
              <p class="text-gray-400">Sub-total:</p>
              <p class="font-bold">Rp.{{ originalSubtotal }}</p>
            </div>
            <div class="flex justify-between py-3">
              <p class="text-gray-400">Diskon:</p>
              <p class="font-bold text-red-500">Rp.{{ totalDiscount }}</p>
            </div>
            <div class="font-bold flex justify-between border-t-2 border-gray-200 py-3">
              <p>Total:</p>
              <p>Rp.{{ totalPaymentWithPromo }}</p>
            </div>
            <!-- Pilihan Metode Pembayaran -->
            <div class="mt-4">
              <label class="block text-gray-700 font-semibold mb-2">Metode Pembayaran:</label>
              <Select
                v-model="selectedPaymentMethod"
                :options="paymentMethods"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Metode"
                class="w-full mb-4 border-gray-300 rounded-md"
                @change="onPaymentMethodChange"
              />
              <Select
                v-if="selectedPaymentMethod === 'va'"
                v-model="selectedPaymentChannel"
                :options="vaChannels"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Bank"
                class="w-full mb-4 border-gray-300 rounded-md"
              />
            </div>
            <div class="mt-4">
              <Button
                label="Checkout"
                class="w-full p-button-primary h-16 rounded-full checkout-gradient"
                :loading="isLoadingPayment"
                :disabled="!selectedPaymentMethod || (selectedPaymentMethod === 'va' && !selectedPaymentChannel)"
                @click="proceedToPayment"
              />
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 pb-10">Your cart is empty.</div>
      </div>
    </Drawer>

    <!-- Promo Code Dialog -->
    <Dialog v-model:visible="showPromoDialog" header="Enter Promo Code" modal :closable="true" :style="{ width: '300px' }">
      <div class="p-4">
        <InputText v-model="promoCode" placeholder="Enter code here" class="w-full p-2 border rounded-md" @keyup.enter="applyPromoCode" />
        <Button label="Apply" class="mt-4 w-full p-button-primary" @click="applyPromoCode" />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showQRCode"
      header="Payment Details"
      modal
      :closable="true"
      :style="{ width: '350px', height: 'auto' }"
      @update:visible="(newValue) => { if (!newValue) cancelTransaction(); else stopCountdown(); }"
    >
      <div class="p-4 text-center">
        <p class="mb-4" v-if="selectedPaymentMethod === 'va'">Silakan lakukan pembayaran melalui Virtual Account berikut:</p>
        <p class="mb-4" v-else-if="selectedPaymentMethod === 'qris'">Silakan scan QRIS berikut untuk pembayaran:</p>
        <p class="mb-4" v-else>Silakan selesaikan pembayaran di halaman iPaymu:</p>
        <p class="text-lg font-bold" v-if="selectedPaymentMethod === 'va'">{{ paymentNo }}</p>
        <p class="text-lg font-bold" v-else-if="selectedPaymentMethod === 'qris'">Scan QRIS di {{ paymentUrl }}</p>
        <p class="text-lg font-bold" v-else><a :href="paymentUrl" target="_blank" class="text-blue-500 underline">Buka Halaman Pembayaran</a></p>
        <p class="mt-2" v-if="selectedPaymentMethod === 'va'">Bank: {{ selectedPaymentChannel.toUpperCase() }}</p>
        <p>Total: Rp{{ totalPaymentWithPromo }}</p>
        <p class="mt-4 text-sm text-gray-500" v-if="selectedPaymentMethod !== 'payment_page'">
          Batas waktu pembayaran: <span class="font-bold text-red-500">{{ formattedCountdown }}</span>
        </p>
        <Button
          label="Complete Payment"
          class="mt-4 w-full p-button-primary checkout-gradient"
          :loading="isCheckingPayment"
          @click="checkAndCompletePayment"
          v-if="selectedPaymentMethod !== 'payment_page'"
        />
      </div>
    </Dialog>

    <!-- Payment Success Modal -->
    <Dialog
      v-model:visible="showPaymentSuccessModal"
      header="Payment Successfully"
      modal
      :closable="true"
      :style="{ width: '300px', height: '300px' }"
    >
      <div class="p-4 text-center">
        <i class="pi pi-check-circle mt-5" style="font-size: 4rem; color: #27ae60" />
        <p class="font-bold mt-6">Your payment was successful!</p>
        <p>Please wait while we prepare your product.</p>
      </div>
    </Dialog>

    <!-- Processing Payment Page -->
    <Dialog 
      v-model:visible="isProcessingPaymentPage" 
      modal 
      :closable="false"
      :style="{ width: '350px', height: 'auto' }"
    >
      <template #header>
        <div class="text-xl font-bold">Processing Payment</div>
      </template>
      <div class="p-4 text-center">
        <ProgressSpinner 
          style="width: 50px; height: 50px" 
          strokeWidth="4" 
          animationDuration=".5s"
          class="mb-4"
        />
        <p class="mb-4">Please complete your payment in the new tab...</p>
        <p class="text-sm text-gray-500">
          Don't close this window while payment is processing
        </p>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { onValue, ref as dbRef, update, push, set, get } from "firebase/database";
import { useToast } from "primevue/usetoast";

export default {
  setup() {
    const router = useRouter();
    const toast = useToast();
    let wiggleInterval = null;
    let inactivityTimeout = null;
    let pollingInterval = null;
    const inactivityDuration = 3000;

    const promos = ref([]);
    const products = ref([]);
    const sortedProducts = ref([]);
    const filter = ref("all");
    const loggedInUser = ref(localStorage.getItem("loggedInUser") || "");
    const isDrawerVisible = ref(false);
    const selectedProduct = ref(null);
    const searchQuery = ref("");
    const cartCount = ref(0);
    const isCartDrawerVisible = ref(false);
    const cartItems = ref([]);
    const totalPayment = ref(0);
    const showPaymentSuccessModal = ref(false);
    const isLoadingPayment = ref(false);
    const showQRCode = ref(false);
    const searchInput = ref(null);
    const showPromoDialog = ref(false);
    const promoCode = ref("");
    const promoDiscount = ref(0);
    const isMenuDrawerVisible = ref(false);
    const showSortOptions = ref(false);
    const sortBy = ref('default');
    const isSortExtended = ref(false);
    const referenceId = ref("");
    const paymentUrl = ref("");
    const paymentNo = ref("");
    const paymentExpired = ref(null);
    const paymentResult = ref(null);
    const isCheckingPayment = ref(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? ' https://22b1-114-10-46-80.ngrok-free.app' : 'http://localhost:3000');

    const selectedPaymentChannel = ref(null); 
    const selectedPaymentMethod = ref(null); 

    const isProcessingPaymentPage = ref(false); 

    const paymentMethods = ref([
      { label: 'Virtual Account (VA)', value: 'va' },
      { label: 'QRIS', value: 'qris' },
      { label: 'iPaymu Payment Page', value: 'payment_page' }, // Opsi baru
    ]);

    const vaChannels = ref([
      { label: 'BAG', value: 'bag' },
      { label: 'BCA', value: 'bca' },
      { label: 'BPD Bali', value: 'bpd_bali' },
      { label: 'BNI', value: 'bni' },
      { label: 'CIMB Niaga', value: 'cimb' },
      { label: 'Mandiri', value: 'mandiri' },
      { label: 'Muamalat', value: 'bmi' },
      { label: 'BRI', value: 'bri' },
      { label: 'BSI', value: 'bsi' },
      { label: 'Permata', value: 'permata' },
      { label: 'Danamon', value: 'danamon' },
    ]);

    const onPaymentMethodChange = () => {
      if (selectedPaymentMethod.value !== 'va') {
        selectedPaymentChannel.value = null; // Reset sub-metode jika bukan VA
      }
      resetInactivityTimer();
    };
    
    const countdownTime = ref(15 * 60); // 15 menit dalam detik
    const countdownInterval = ref(null);
    
    const isTransactionCancelled = ref(false); 

    const startCountdown = () => {
        stopCountdown(); // Pastikan tidak ada interval yang berjalan
        countdownTime.value = 15 * 60; // Reset ke 15 menit
        countdownInterval.value = setInterval(() => {
            if (countdownTime.value > 0) {
                countdownTime.value -= 1;
            } else {
                stopCountdown();
                showQRCode.value = false;
                toast.add({
                    severity: "warn",
                    summary: "Payment Expired",
                    detail: "Waktu pembayaran telah habis, silakan coba lagi",
                    life: 3000
                });
            }
        }, 1000);
    };

    const stopCountdown = () => {
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
    };

    const cancelTransaction = async () => {
      console.log('Cancelling transaction for referenceId:', referenceId.value);
      stopPollingTransactionStatus();
      stopCountdown();
      showQRCode.value = false;
      isTransactionCancelled.value = true; 

      if (referenceId.value) {
        try {
          const response = await fetch('http://localhost:3000/api/cancel-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referenceId: referenceId.value })
          });
          const result = await response.json();
          console.log('Cancel response from server:', result);
        } catch (error) {
          console.error('Error notifying server of cancellation:', error);
        }
      }

      referenceId.value = '';
      paymentNo.value = '';
      paymentUrl.value = '';
      paymentExpired.value = null;
      paymentResult.value = null;
      toast.add({
        severity: "info",
        summary: "Transaction Cancelled",
        detail: "Transaksi telah dibatalkan oleh pengguna",
        life: 3000
      });
      // Keranjang tetap dipertahankan
    };

    const formattedCountdown = computed(() => {
        const minutes = Math.floor(countdownTime.value / 60).toString().padStart(2, '0');
        const seconds = (countdownTime.value % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    });

    const originalSubtotal = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.product.price * item.quantity, 0);
    });

    const totalDiscount = computed(() => {
      return originalSubtotal.value - totalPaymentWithPromo.value;
    });

    const totalPaymentWithPromo = computed(() => {
      const subtotal = cartItems.value.reduce((total, item) => {
        const price = getDiscountedPrice(item.product);
        return total + price * item.quantity;
      }, 0);
      return Math.round(subtotal * (1 - promoDiscount.value / 100));
    });

    const toggleSortOption = () => {
      isSortExtended.value = !isSortExtended.value;
      showSortOptions.value = isSortExtended.value;
      resetInactivityTimer();
    };

    const setSortOption = (option) => {
      sortBy.value = option;
      isSortExtended.value = false;
      showSortOptions.value = false;
      updateSortedProducts();
      resetInactivityTimer();
    };

    const filterLabel = computed(() => {
      return { all: "Semua", food: "Makanan", drink: "Minuman" }[filter.value] || "Semua";
    });

    const validPromoCodes = { "DISKON10": 10, "DISKON20": 20, "FREESHIP": 15 };

    const logActivity = async (activityCode, description = null) => {
      if (!loggedInUser.value) return;
      const statusChangesRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
      try {
        await push(statusChangesRef, {
          type: "activity",
          code: activityCode,
          timestamp: new Date().toISOString(),
          ...(description && { description }),
        });
        console.log(`Activity ${activityCode} logged for ${loggedInUser.value}`);
      } catch (error) {
        console.error("Error logging activity:", error);
      }
    };

    const testConnection = async () => {
      try {
        await get(dbRef(db, "users"));
        toast.add({ severity: "success", summary: "Connection Test", detail: "Connection to Firebase is successful.", life: 3000 });
        await logActivity("A001");
      } catch (error) {
        toast.add({ severity: "error", summary: "Connection Test", detail: "Failed to connect to Firebase.", life: 3000 });
      }
    };

    const getDiscountedPrice = (product) => {
      return product.discount && product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;
    };

    const getAvailableStock = (product) => {
      const cartItem = cartItems.value.find((item) => item.product.id === product.id);
      return product.stock - (cartItem ? cartItem.quantity : 0);
    };

    const resetInactivityTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      // Jangan mulai timer jika sedang dalam keadaan yang tidak boleh di-refresh
      if (!isCartDrawerVisible.value && !isLoadingPayment.value && !showQRCode.value) {
        inactivityTimeout = setTimeout(refreshApp, inactivityDuration);
      }
    };

    const refreshApp = () => {
      if (!isCartDrawerVisible.value && !isLoadingPayment.value && !showQRCode.value) {
        console.log("Refreshing app due to inactivity...");
        filter.value = "all";
        searchQuery.value = "";
        isDrawerVisible.value = false;
        isCartDrawerVisible.value = false;
        isMenuDrawerVisible.value = false;
        cartItems.value = [];
        cartCount.value = 0;
        totalPayment.value = 0;
        if (searchInput.value) searchInput.value.$el.blur();
        fetchData();
        window.scrollTo(0, 0);
        logActivity("A002");
      }
    };

    const fetchData = async () => {
      onValue(dbRef(db, "promos"), (snapshot) => {
        const fetchedPromos = snapshot.val();
        promos.value = fetchedPromos ? Object.values(fetchedPromos).filter((item) => item?.image && item?.name) : [];
      });

      onValue(dbRef(db, "products"), (snapshot) => {
        const fetchedProducts = snapshot.val();
        products.value = fetchedProducts ? Object.values(fetchedProducts).filter((item) => item?.image && item?.name) : [];
        updateSortedProducts();
      });

      if (loggedInUser.value) {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        const statusChangeRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
        logActivity("S001");
        try {
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            await set(userRef, {
              username: loggedInUser.value,
              password: userData.password,
              status: "S001",
              statusChanges: userData.statusChanges || {},
            });
            await push(statusChangeRef, { status: "S001", timestamp: new Date().toISOString() });
          }
        } catch (error) {
          console.error("Error setting status to S001:", error);
        }
      }
    };

    const updateSortedProducts = () => {
      let results = [...products.value];
      if (filter.value !== "all") {
        results = results.filter((product) => filter.value === "food" ? product.image.includes("food") : product.image.includes("drink"));
      }
      if (searchQuery.value.trim()) {
        results = results.filter((product) => product.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
      }
      if (sortBy.value === 'priceLowToHigh') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy.value === 'priceHighToLow') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy.value === 'discountHighToLow') {
        results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      } else {
        results.sort((a, b) => b.stock - a.stock);
      }
      sortedProducts.value = results;
    };

    const handleUserActivity = () => resetInactivityTimer();

    const selectSort = (type) => {
      filter.value = type;
      updateSortedProducts();
      resetInactivityTimer();
      setTimeout(() => {
        const productGrid = document.getElementById("featured-products");
        if (productGrid) productGrid.scrollIntoView({ behavior: "smooth" });
      }, 0);
    };

    const startWiggleAnimation = () => {
      if (wiggleInterval) clearInterval(wiggleInterval);
      wiggleInterval = setInterval(() => {
        const iconWrapper = document.querySelector('.cart-icon-wrapper');
        const cartButton = document.querySelector('.cart-button');
        if (iconWrapper && cartCount.value > 0) {
          iconWrapper.classList.remove('wiggle');
          cartButton.classList.remove('scale');
          void cartButton.offsetWidth;
          cartButton.classList.add('scale');
          void iconWrapper.offsetWidth;
          iconWrapper.classList.add('wiggle');
        }
      }, 2000);
    };

    watch(cartCount, (newCount) => {
      if (newCount > 0) startWiggleAnimation();
      else if (wiggleInterval) clearInterval(wiggleInterval);
    });

    const isInCart = (product) => cartItems.value.some((item) => item.product.id === product.id);

    const responsiveOptions = ref([
      { breakpoint: "1400px", numVisible: 1, numScroll: 1 },
      { breakpoint: "1199px", numVisible: 1, numScroll: 1 },
      { breakpoint: "767px", numVisible: 1, numScroll: 1 },
      { breakpoint: "575px", numVisible: 1, numScroll: 1 },
    ]);

    const getSeverity = (status) => ({
      "INSTOCK": "success",
      "LOWSTOCK": "warn",
      "OUTOFSTOCK": "danger"
    }[status] || null);

    const addToCart = (product) => {
      if (getAvailableStock(product) <= 0) {
        toast.add({ severity: "warn", summary: "Out of Stock", detail: `${product.name} is out of stock.`, life: 3000 });
        return;
      }
      const existingItem = cartItems.value.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
          cartCount.value += 1;
          logActivity("A004", `Rak ${product.rak}`);
        } else {
          toast.add({ severity: "warn", summary: "Stock Limit Reached", detail: `Cannot add more ${product.name}.`, life: 3000 });
        }
      } else {
        cartItems.value.unshift({ product: { ...product }, quantity: 1 });
        cartCount.value += 1;
        logActivity("A004", `Rak ${product.rak}`);
      }
      calculateTotalPayment();
      resetInactivityTimer();
    };

    const removeFromCart = (product) => {
      const itemIndex = cartItems.value.findIndex((item) => item.product.id === product.id);
      if (itemIndex !== -1) {
        const item = cartItems.value[itemIndex];
        cartCount.value -= item.quantity;
        cartItems.value.splice(itemIndex, 1);
        calculateTotalPayment();
        resetInactivityTimer();
        if (cartCount.value < 0) cartCount.value = 0;
        const totalItems = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount.value !== totalItems) cartCount.value = totalItems;
        if (cartItems.value.length === 0) isCartDrawerVisible.value = false;
      }
    };

    const calculateTotalPayment = () => {
      totalPayment.value = cartItems.value.reduce((total, item) => {
        const price = getDiscountedPrice(item.product);
        return total + price * item.quantity;
      }, 0);
    };

    const animateProductToCart = (event, product) => {
      const { clientX, clientY } = event;
      const cartIcon = document.querySelector(".pi-shopping-cart");
      if (!cartIcon) return;
      const cartRect = cartIcon.getBoundingClientRect();
      const animatingElem = document.createElement("div");
      animatingElem.className = "animating-product";
      animatingElem.style.backgroundImage = `url(${product.image})`;
      animatingElem.style.position = "fixed";
      animatingElem.style.width = "100px";
      animatingElem.style.height = "100px";
      animatingElem.style.borderRadius = "100%";
      animatingElem.style.backgroundSize = "cover";
      animatingElem.style.left = `${clientX - 20}px`;
      animatingElem.style.top = `${clientY}px`;
      animatingElem.style.transition = "all 1s ease-in-out";
      animatingElem.style.zIndex = "1100";
      document.body.appendChild(animatingElem);
      setTimeout(() => {
        animatingElem.style.left = `${cartRect.left + cartRect.width / 2}px`;
        animatingElem.style.top = `${cartRect.top + cartRect.height / 2}px`;
        animatingElem.style.transform = "scale(0.5)";
        animatingElem.style.opacity = "0";
        setTimeout(() => document.body.removeChild(animatingElem), 1000);
      }, 10);
    };

    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity -= 1;
        cartCount.value -= 1;
      } else {
        cartItems.value = cartItems.value.filter((cartItem) => cartItem.product.id !== item.product.id);
        cartCount.value -= 1;
        if (cartItems.value.length === 0) toggleCartDrawer();
      }
      calculateTotalPayment();
      resetInactivityTimer();
      logActivity("A004", `Rak ${item.product.rak}`);
    };

    const increaseQuantity = (item) => {
      if (getAvailableStock(item.product) > 0) {
        item.quantity += 1;
        cartCount.value += 1;
        calculateTotalPayment();
        resetInactivityTimer();
        logActivity("A004", `Rak ${item.product.rak}`);
      } else {
        toast.add({ severity: "warn", summary: "Stock Limit Reached", detail: `Cannot add more ${item.product.name}.`, life: 3000 });
      }
    };

    const proceedToPayment = async () => {
      isLoadingPayment.value = true;
      isTransactionCancelled.value = false;
      try {
        const paymentData = {
          total: totalPaymentWithPromo.value,
          buyerName: "Customer Name",
          buyerPhone: "08123456789",
          buyerEmail: "customer@mail.com",
          paymentMethod: selectedPaymentMethod.value,
          paymentChannel: selectedPaymentMethod.value === 'va' ? selectedPaymentChannel.value : null,
          products: cartItems.value.map(item => item.product.name),
          quantities: cartItems.value.map(item => item.quantity.toString()),
          prices: cartItems.value.map(item => getDiscountedPrice(item.product).toString()),
        };
        
        console.log('Sending payment data:', paymentData);

        const response = await fetch(`${API_BASE_URL}/api/ipaymu-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log('Payment Result:', result);
        paymentResult.value = result;

        if (String(result.Status) === "200") {
          if (selectedPaymentMethod.value === 'payment_page') {
            // Untuk Payment Page, buka di tab baru dan mulai polling
            isProcessingPaymentPage.value = true; 
            window.open(result.Data.Url, '_blank');
            referenceId.value = result.Data.ReferenceId;
            showQRCode.value = false; // Tidak perlu tampilkan QR code modal
            startPollingTransactionStatus();
          } else {
            // Logika VA/QRIS yang sudah ada
            paymentUrl.value = result.Data?.Url || "";
            paymentNo.value = result.Data?.PaymentNo || 'Scan QRIS';
            referenceId.value = result.Data?.ReferenceId || "";
            showQRCode.value = true;
            startCountdown();
            startPollingTransactionStatus();
          }
        } else {
          toast.add({
            severity: "error",
            summary: "Payment Failed",
            detail: result.Message || "Failed to process payment",
            life: 3000
          });
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "An error occurred during payment processing",
          life: 3000
        });
      } finally {
        isLoadingPayment.value = false;
      }
    };

    const completePayment = async (transactionId) => {
      console.log('completePayment called with:', transactionId);
      try {
        // Simpan amount terakhir di localStorage untuk ditampilkan di thank you page
        localStorage.setItem('lastPaymentAmount', totalPaymentWithPromo.value);
        
        // Update stock dan log activity
        for (const item of cartItems.value) {
          const productRef = dbRef(db, `products/${item.product.id}`);
          const newStock = item.product.stock - item.quantity;
          const updatedInventoryStatus = determineInventoryStatus(newStock);
          await update(productRef, { stock: newStock >= 0 ? newStock : 0, inventoryStatus: updatedInventoryStatus });
        }

        // Simpan receipt ke Firebase
        const receiptsRef = dbRef(db, "receipts");
        const newReceiptRef = push(receiptsRef);
        const receiptData = {
          timestamp: new Date().toISOString(),
          items: cartItems.value.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            totalPrice: getDiscountedPrice(item.product) * item.quantity,
            quantity: item.quantity,
            rak: item.product.rak,
            discount: item.product.discount || 0
          })),
          grandTotal: totalPaymentWithPromo.value,
          usedVoucher: promoDiscount.value > 0,
          voucherDiscount: promoDiscount.value,
          paymentMethod: selectedPaymentMethod.value === 'va' ? `VA ${selectedPaymentChannel.value.toUpperCase()}` : 
                      selectedPaymentMethod.value === 'qris' ? 'QRIS MPM' : 'iPaymu Payment Page',
          transactionId: transactionId || paymentResult.value?.Data?.TransactionId || "PENDING"
        };
        await set(newReceiptRef, receiptData);

        // Bersihkan keranjang
        cartItems.value = [];
        cartCount.value = 0;
        totalPayment.value = 0;
        promoDiscount.value = 0;
        selectedPaymentMethod.value = null;
        selectedPaymentChannel.value = null;

        toast.add({
          severity: "success",
          summary: "Payment Success",
          detail: "Your transaction has been completed successfully",
          life: 3000
        });

        if (selectedPaymentMethod.value === 'payment_page') {
          router.push(`/thank-you?reference_id=${referenceId.value}`);
        } else {
          showQRCode.value = false;
          showPaymentSuccessModal.value = true;
        }
      } catch (error) {
        console.error("Error completing payment:", error);
        toast.add({
          severity: "error",
          summary: "Payment Failed",
          detail: "Failed to complete payment process",
          life: 3000
        });
      }
    };

    const checkTransactionStatus = async (refId) => {
        if (!refId) return;
        try {
            const response = await fetch('http://localhost:3000/api/check-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceId: refId })
            });
            const status = await response.json();
            console.log('Transaction Status:', status);

            if (status.error) {
                console.error('Server returned an error:', status.error);
                toast.add({
                    severity: "error",
                    summary: "Server Error",
                    detail: "Terjadi masalah pada server, silakan coba lagi nanti",
                    life: 3000
                });
                stopPollingTransactionStatus();
                stopCountdown(); 
                showQRCode.value = false;
                isTransactionCancelled.value = true;
                isProcessingPaymentPage.value = false;  
                return;
            }

            if (status.status === 'berhasil') {
                stopPollingTransactionStatus();
                isProcessingPaymentPage.value = false; 
                stopCountdown(); 
                await completePayment(status.transactionId);

                toast.add({
                  severity: "success",
                  summary: "Payment Completed",
                  detail: "Payment has been successfully processed",
                  life: 3000
                });

                if (selectedPaymentMethod.value === 'payment_page') {
                  router.push('/thank-you?reference_id=' + refId);
                }

                showQRCode.value = false;
                showPaymentSuccessModal.value = true;
            } else if (status.status === 'gagal') {
                stopPollingTransactionStatus();
                isProcessingPaymentPage.value = false; 
                stopCountdown(); 
                toast.add({
                    severity: "error",
                    summary: "Payment Failed",
                    detail: "Pembayaran gagal, silakan coba lagi",
                    life: 3000
                });
                showQRCode.value = false;
                isTransactionCancelled.value = true; 
            }
        } catch (error) {
            console.error('Error checking transaction:', error);
            isProcessingPaymentPage.value = false; 
            toast.add({
                severity: "error",
                summary: "Network Error",
                detail: "Gagal memeriksa status transaksi, periksa koneksi Anda",
                life: 3000
            });
        }
    };

    const startPollingTransactionStatus = () => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(() => checkTransactionStatus(referenceId.value), 5000);
    };

    const stopPollingTransactionStatus = () => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = null;
    };

    const checkAndCompletePayment = async () => {
      isCheckingPayment.value = true;
      await checkTransactionStatus(referenceId.value);
      isCheckingPayment.value = false;
    };

    const determineInventoryStatus = (stock) => {
      if (stock > 5) return "INSTOCK";
      if (stock > 0) return "LOWSTOCK";
      return "OUTOFSTOCK";
    };

    const restoreScrollBehavior = () => {
      document.body.classList.remove("body-no-scroll");
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.position = '';
      document.body.style.position = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.documentElement.style.width = '';
      document.body.style.width = '';
    };

    const toggleCartDrawer = () => {
      isCartDrawerVisible.value = !isCartDrawerVisible.value;
      if (isCartDrawerVisible.value) {
        document.body.classList.add("body-no-scroll");
        if (cartCount.value > 0) {
          logActivity("A003");
        }
      } else {
        restoreScrollBehavior(); 
      }
      resetInactivityTimer();
    };

    const toggleMenuDrawer = () => {
      isMenuDrawerVisible.value = !isMenuDrawerVisible.value;
      resetInactivityTimer();
    };

    const navigateTo = (path) => {
      router.push(path);
      isMenuDrawerVisible.value = false;
      resetInactivityTimer();
    };

    const filteredProducts = computed(() => sortedProducts.value);

    const openDrawer = (product) => {
      selectedProduct.value = product;
      isDrawerVisible.value = true;
      resetInactivityTimer();
    };

    const closeDrawer = () => {
      isDrawerVisible.value = false;
      resetInactivityTimer();
    };

    watch(searchQuery, () => {
      updateSortedProducts();
      resetInactivityTimer();
    });

    const togglePromoDialog = () => {
      showPromoDialog.value = !showPromoDialog.value;
      resetInactivityTimer();
    };

    const applyPromoCode = () => {
      const code = promoCode.value.trim().toUpperCase();
      if (validPromoCodes[code]) {
        promoDiscount.value = validPromoCodes[code];
        toast.add({ severity: "success", summary: "Success", detail: "Promo code applied!", life: 3000 });
        showPromoDialog.value = false;
      } else {
        toast.add({ severity: "error", summary: "Error", detail: "Invalid promo code", life: 3000 });
      }
      promoCode.value = "";
    };

    watch(() => isCartDrawerVisible.value, (newVal) => {
      if (!newVal) {
        restoreScrollBehavior();
      }
    });

    onMounted(() => {
      fetchData();
      resetInactivityTimer();
      testConnection();
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      if (cartCount.value > 0) startWiggleAnimation();
      if (window.location.pathname === '/thank-you' && referenceId.value) {
        checkTransactionStatus(referenceId.value);
        console.log("thankyou");
      }
      window.addEventListener('message', (event) => {
        if (event.data.type === 'payment_completed') {
          // Tutup modal loading jika ada
          isProcessingPaymentPage.value = false;
          stopPollingTransactionStatus();
          
          // Refresh data jika perlu
          fetchData();
          
          // Tampilkan notifikasi
          toast.add({
            severity: "success",
            summary: "Payment Success",
            detail: "Your payment has been completed successfully",
            life: 3000
          });
        }
      });
    });

    onUnmounted(() => {
      if (wiggleInterval) clearInterval(wiggleInterval);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      stopPollingTransactionStatus();
      stopCountdown();
      restoreScrollBehavior(); 
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      document.body.classList.remove("body-no-scroll");
    });

    return {
      isProcessingPaymentPage, 
      selectedPaymentMethod, 
      selectedPaymentChannel, 
      paymentMethods, 
      vaChannels, 
      onPaymentMethodChange, 
      isTransactionCancelled, 
      cancelTransaction, 
      countdownTime, 
      formattedCountdown, 
      startCountdown, 
      stopCountdown, 
      originalSubtotal,
      totalDiscount,
      isSortExtended,
      showSortOptions,
      sortBy,
      toggleSortOption,
      setSortOption,
      loggedInUser,
      isInCart,
      addToCart,
      removeFromCart,
      promos,
      responsiveOptions,
      getSeverity,
      products,
      filter,
      filterLabel,
      filteredProducts,
      sortedProducts,
      selectSort,
      openDrawer,
      isDrawerVisible,
      selectedProduct,
      searchQuery,
      cartCount,
      isCartDrawerVisible,
      toggleCartDrawer,
      cartItems,
      totalPayment,
      decreaseQuantity,
      increaseQuantity,
      proceedToPayment,
      showPaymentSuccessModal,
      isLoadingPayment,
      showQRCode,
      animateProductToCart,
      closeDrawer,
      searchInput,
      totalPaymentWithPromo,
      getDiscountedPrice,
      getAvailableStock,
      showPromoDialog,
      togglePromoDialog,
      promoCode,
      applyPromoCode,
      isMenuDrawerVisible,
      toggleMenuDrawer,
      navigateTo,
      paymentUrl,
      paymentNo,
      paymentExpired,
      paymentResult,
      isCheckingPayment,
      checkAndCompletePayment
    };
  },
};
</script>

<style>
.body-no-scroll {
  overflow: hidden;
  height: 100%;
  position: fixed;
  width: 100%;
}

.drawer-transition {
  transition: all 0.5s ease; 
}


.checkout-gradient {
  background: linear-gradient(60deg, #4CAF50, #2196F3, #4CAF50);
  background-size: 200% 200%;
  animation: gradientAnimation 5s ease infinite;
}

.food-gradient {
  background: linear-gradient(60deg, #33BFFF, #33BFFF, #00ccff);
  background-size: 200% 200%;
  animation: gradientAnimation 10s ease infinite;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 25%; }
  50% { background-position: 100% 75%; }
  100% { background-position: 0% 25%; }
}

.animating-product {
  z-index: 1100;
  pointer-events: none;
}

.cart-button {
  padding: 0.75rem 1rem;
  height: 3.5rem;
  min-width: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cart-icon-wrapper { display: inline-flex; align-items: center; }
.cart-content { display: inline-flex; align-items: center; transition: all 0.3s ease; }
.text-red-600 { color: #dc2626; }
.text-gray-500 { color: #6b7280; }
.line-through { text-decoration: line-through; }
.pi-ticket { font-size: 1.2rem; }
.overflow-x-auto { -webkit-overflow-scrolling: touch; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.sort-button {
  transition: width 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
  width: 56px;
  height: 56px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-button.extended { width: 120px; }
.sort-button .text { display: inline-block; margin-left: 6px; opacity: 0; transition: opacity 0.3s ease; }
.sort-button.extended .text { opacity: 1; }


.product-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.image-container {
  width: 100%;
  flex-shrink: 0; /* Mencegah gambar menyusut melebihi ukuran asli */
}

.product-image {
  width: 100%;
  height: auto; /* Membiarkan tinggi menyesuaikan proporsi gambar */
  max-height: 35vh; /* Batas maksimum tinggi gambar agar tidak terlalu besar */
  object-fit: cover; /* Gambar memenuhi lebar tanpa terpotong, tapi tetap proporsional */
  border-radius: 8px 8px 0 0;
}

.content-container {
  flex-grow: 1; /* Membiarkan konten mengisi sisa ruang */
  position: relative;
  z-index: 1;
}

.price-container {
  min-height: 48px; /* Sesuaikan nilai ini agar cukup untuk dua baris teks */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Memastikan teks berada di tengah vertikal */
}

.bg-beige {
  background-color: #f5e8c7;
}

.relative .absolute {
  transition: all 0.3s ease-in-out;
}

.hover\:shadow-2xl:hover .absolute {
  opacity: 0.5; /* Efek hover untuk background */
}

.sort-button-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.pop-enter-active {
    animation: popIn 0.3s ease-out;
  }
  
  .pop-leave-active {
    animation: popOut 0.3s ease-in;
  }
  
  .cart-button.scale {
    animation: scaleUpDown 0.3s ease;
  }
  
  .cart-icon-wrapper.wiggle {
    animation: wiggleAndJump 0.3s ease;
  }

.sticky {
    position: -webkit-sticky; 
    position: sticky;
    top: 0;
    z-index: 50;
}

.rainbow-spots {
    position: relative;
    overflow: hidden;
  }
  
.rainbow-spots::before,
.rainbow-spots::after {
  content: '';
  position: absolute;
  width: 150px; /* Ukuran lingkaran kecil */
  height: 150px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 50%);
  animation: rainbowSmooth 5s linear infinite;
}

.rainbow-spots::before {
  top: -25px; /* Pojok kanan atas */
  right: -25px;
}
  
  @keyframes rainbowSmooth {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }

@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}
  
@keyframes popOut {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0); opacity: 0; }
}
  
@keyframes wiggleAndJump {
    0% { transform: translateY(0) rotate(0deg) scale(1); }
    25% { transform: translateY(-10px) rotate(10deg) scale(1.2); }
    50% { transform: translateY(0) rotate(-10deg) scale(1.5); }
    75% { transform: translateY(-10px) rotate(5deg) scale(1.2); }
    100% { transform: translateY(0) rotate(0deg) scale(1); }
}
  
@keyframes scaleUpDown {
    0% { height: 3.5rem; }
    25% { transform: scale(1.3); height: 3.55rem; }
    50% { height: 3.55rem; }
    75% { height: 3.55rem; }
    100% { height: 3.5rem; }
}

.p-progress-spinner-circle {
  stroke: linear-gradient(60deg, #4CAF50, #2196F3);
  animation: p-progress-spinner-dash 1.5s ease-in-out infinite;
}

@keyframes p-progress-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}

</style>



