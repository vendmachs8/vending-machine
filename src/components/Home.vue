<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header and Content -->
    <header class="w-full">
      <div class="pt-3 px-8 text-sm text-gray-500 mb-3">
        <p v-if="loggedInUser" class="text-lg font-semibold text-gray-700 mb-1">
          Hai {{ loggedInUser }}
        </p>
        <p>
          <i class="pi pi-map-marker mr-1" style="font-size: smaller"></i>Lokasi
          : Universitas Brawijaya
        </p>
      </div>
    </header>

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
                class="w-full h-50 object-cover aspect-image rounded-xl"
              />
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <!-- Featured Products -->
    <section class="container mx-auto px-4 py-6">
      <h2 class="text-xl font-semibold md-4" id="featured-products">Featured Products</h2>

      <!-- Sticky Bar with Search and Sort -->
      <div class="sticky top-0 z-50 bg-transparent shadow-lg">
        <div class="relative py-2 px-2 flex justify-between items-center gap-2">
          <!-- Search Input -->
          <div class="relative flex items-center">
            <IconField class="flex items-center justify-center">
              <InputIcon
                class="pi pi-search cursor-pointer px-1"
                @click="toggleSearch"
                :class="{ 'text-primary-500': isSearchExpanded, 'text-gray-500': !isSearchExpanded }"
              />
              <InputText
                ref="searchInput"
                v-model="searchQuery"
                placeholder="Search Products"
                class="search-input transition-all duration-500 ease-in-out rounded-md"
                :class="{ 'w-0 px-2 py-2': !isSearchExpanded, 'w-40 px-2 py-2 opacity-100': isSearchExpanded }"
              />
            </IconField>
          </div>

          <!-- Sort Button -->
          <button
            ref="sortButton"
            @click="toggleSortMenu"
            class="flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-primary-100 rounded-md transition-colors hover:bg-primary-200 flex-grow"
          >
            <i class="pi pi-sort-alt mr-2"></i>
            <span>Urutkan: {{ filterLabel }}</span>
            <i class="pi pi-angle-down ml-2"></i>
          </button>

          <!-- Promo Code Button -->
          <button
            @click="togglePromoDialog"
            class="flex items-center justify-center py-2 px-2 text-white bg-primary-100 rounded-md transition-colors hover:bg-primary-200"
          >
            <i class="pi pi-ticket" style="font-size: 1.2rem"></i>
          </button>

          <!-- Dropdown Menu -->
          <transition name="pop">
            <div
              ref="dropdownMenu"
              v-if="isSortMenuOpen"
              class="absolute right-12 top-full mt-1 bg-white/80 shadow-lg rounded-md z-10 font-semibold"
            >
              <button
                @click="selectSort('all')"
                class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Semua
              </button>
              <button
                @click="selectSort('food')"
                class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Makanan
              </button>
              <button
                @click="selectSort('drink')"
                class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Minuman
              </button>
            </div>
          </transition>
           
          
        </div>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="[
            'relative transition ease-in-out delay-150 hover:shadow-2xl duration-300 shadow-grey-500 border-none border-surface-200 dark:border-surface-700 bg-azure rounded-2xl p-3 flex flex-col justify-between h-full rainbow-spots',
            { 'opacity-30 shadow-2xl': getAvailableStock(product) === 0 }
          ]"
          @click="openDrawer(product)"
        >
          <!-- Diskon di Pojok Kanan Atas -->
          <div v-if="product.discount > 0" class="absolute top-1 right-1 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
            -{{ product.discount }}%
          </div>

          <div class="flex justify-center items-center">
            <img
              :src="product.image"
              alt="product.name"
              class="transition ease-in-out delay-150 hover:-translate-y-2 hover:scale-125 duration-300 w-38 h-38 object-cover rounded-full mb-2"
            />
          </div>
          <Tag
            :value="product.inventoryStatus"
            :severity="getSeverity(product.inventoryStatus)"
            class="rounded-xl -ml-3 mr-auto justify-start"
            style="border-radius: 0 10px 10px 0"
          />
          <h3 class="text-lg font-medium mt-2 text-center">{{ product.name }}</h3>
          <p class="text-sm text-gray-500 mt-1 text-center">{{ product.desc }}</p>
          <p class="text-sm text-gray-500 mt-1 text-center">
            No.{{ product.rak }} | Stok : {{ getAvailableStock(product) }}
          </p>
          <div class="flex justify-between items-center mt-2">
            <div>
              <p v-if="product.discount > 0" class="text-red-600 font-bold">IDR{{ getDiscountedPrice(product) }}</p>
              <p v-if="product.discount > 0" class="text-gray-400 line-through">IDR{{ product.price }}</p>
              <p v-else class="text-gray-600 font-bold">IDR{{ product.price }}</p>
            </div>
            <div class="justify-items-end items-end">
              <button
                :disabled="getAvailableStock(product) === 0"
                class="text-white px-3 py-2 rounded-xl transition"
                :class="{
                  'bg-gray-400 cursor-not-allowed': getAvailableStock(product) === 0,
                  'bg-primary-200 hover:bg-primary-300': getAvailableStock(product) > 0
                }"
                @click.stop="
                  (event) => {
                    animateProductToCart(event, product);
                    addToCart(product);
                  }
                "
              >
                <i class="pi pi-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Drawer Pop -->
    <Drawer
      v-model:visible="isDrawerVisible"
      position="bottom"
      style="height: auto"
    >
      <template #header>
        <div v-if="selectedProduct" class="text-2xl font-bold">
          {{ selectedProduct.name }}
        </div>
      </template>
      <div v-if="selectedProduct" class="p-4">
        <img
          :src="selectedProduct.image"
          alt="selectedProduct.name"
          class="animate-pulse w-full h-full object-cover rounded-md mb-4"
        />
        <p class="text-lg text-gray-500 mt-2">{{ selectedProduct.desc }}</p>
        <p class="text-sm text-gray-500 mt-2">
          Rak: {{ selectedProduct.rak }} | Stok: {{ getAvailableStock(selectedProduct) }}
        </p>
        <div class="mt-4 flex justify-center items-center gap-2">
          <p v-if="selectedProduct.discount > 0" class="text-red-600 font-bold text-2xl">IDR{{ getDiscountedPrice(selectedProduct) }}</p>
          <p v-if="selectedProduct.discount > 0" class="text-gray-500 line-through text-lg">IDR{{ selectedProduct.price }}</p>
          <p v-else class="text-gray-600 font-bold text-2xl">IDR{{ selectedProduct.price }}</p>
        </div>
        <button
          :disabled="getAvailableStock(selectedProduct) === 0"
          class="mt-4 text-white px-4 py-2 rounded-md transition w-full"
          :class="{ 'bg-gray-400 cursor-not-allowed': getAvailableStock(selectedProduct) === 0, 'bg-primary-500': getAvailableStock(selectedProduct) > 0 }"
          @click="
            (event) => {
              closeDrawer(selectedProduct);
              animateProductToCart(event, selectedProduct);
              addToCart(selectedProduct);
            }
          "
        >
          <i class="pi pi-shopping-cart mr-2"></i>
          Add to Cart
        </button>
      </div>
    </Drawer>

    <!-- Cart Drawer -->
    <Drawer
      v-model:visible="isCartDrawerVisible"
      position="bottom"
      style="height: auto; overflow-y: auto"
    >
      <template #header>
        <div class="text-2xl font-bold">Your Cart</div>
      </template>
      <div class="p-4">
        <div v-if="cartItems.length > 0">
          <div
            v-for="(item, index) in cartItems"
            :key="index"
            class="flex items-center justify-between mb-4"
          >
            <img
              :src="item.product.image"
              alt="product.name"
              class="w-12 h-12 object-cover rounded-md"
            />
            <div class="flex flex-col">
              <span class="font-medium">{{ item.product.name }}</span>
              <span class="text-sm text-gray-500">Qty: {{ item.quantity }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="p-2 bg-red-500 rounded-md"
                @click="decreaseQuantity(item)"
              >
                <i class="pi pi-minus" />
              </button>
              <button
                class="p-2 bg-blue-500 rounded-md"
                :disabled="getAvailableStock(item.product) <= item.quantity"
                @click="increaseQuantity(item)"
              >
                <i class="pi pi-plus" />
              </button>
            </div>
            <div class="text-right">
              <span v-if="item.product.discount > 0" class="font-bold text-red-600">Rp{{ getDiscountedPrice(item.product) * item.quantity }}</span>
              <span v-if="item.product.discount > 0" class="block text-gray-500 line-through text-sm">Rp{{ item.product.price * item.quantity }}</span>
              <span v-else class="font-bold">Rp{{ item.product.price * item.quantity }}</span>
            </div>
          </div>
          <div class="text-xl font-bold text-right mt-8">
            Total: Rp.{{ totalPaymentWithPromo }}
          </div>
          <div class="mt-4">
            <Button
              label="Proceed to Payment"
              class="w-full p-button-primary"
              :loading="isLoadingPayment"
              @click="proceedToPayment"
            />
          </div>
        </div>
        <div v-else class="text-center text-gray-500">Your cart is empty.</div>
      </div>
    </Drawer>

    <!-- Promo Code Dialog -->
    <Dialog
      v-model:visible="showPromoDialog"
      header="Enter Promo Code"
      modal
      :closable="true"
      :style="{ width: '300px' }"
    >
      <div class="p-4">
        <InputText
          v-model="promoCode"
          placeholder="Enter code here"
          class="w-full p-2 border rounded-md"
          @keyup.enter="applyPromoCode"
        />
        <Button
          label="Apply"
          class="mt-4 w-full p-button-primary"
          @click="applyPromoCode"
        />
      </div>
    </Dialog>

    <!-- QR Code Dialog -->
    <Dialog
      v-model:visible="showQRCode"
      header="Scan Here"
      modal
      :closable="true"
      :style="{ width: '350px', height: '400px' }"
    >
      <div class="p-4 text-center">
        <img :src="qrCode" alt="QR Code" class="mx-auto mb-4" />
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
        <i
          class="pi pi-check-circle mt-5"
          style="font-size: 4rem; color: #27ae60"
        />
        <p class="font-bold mt-6">Your payment was successful!</p>
        <p>Please wait while we prepare your product.</p>
      </div>
    </Dialog>

    <!-- Floating Cart Button -->
    <transition name="pop">
      <button
        v-if="cartCount > 0 && !isCartDrawerVisible"
        @click="toggleCartDrawer"
        class="fixed bottom-20 right-6 z-50 rounded-full shadow-lg bg-primary-300 text-white hover:bg-primary-600 transition-all duration-300 flex items-center gap-2 cart-button"
      >
        <span class="cart-icon-wrapper">
          <i class="pi pi-shopping-cart text-xl" style="font-size: 1.5rem"></i>
        </span>
        <span class="cart-content font-bold">BAYAR</span>
        <span
          class="cart-count-badge absolute -top-1 -right-1 bg-red-500 text-white text-md font-bold w-8 h-6 flex items-center justify-center rounded-full shadow-md"
        >{{ cartCount }}</span>
      </button>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import qrcodeImage from "../assets/qrcode.png";
import { db } from "../firebase";
import { onValue, ref as dbRef, update, push, set } from "firebase/database";
import { useToast } from "primevue/usetoast";

export default {
  setup() {
    let wiggleInterval = null;
    let inactivityTimeout = null;
    const inactivityDuration = 30000;
    const toast = useToast();
    const promos = ref([]);
    const products = ref([]); // Produk asli dari Firebase
    const sortedProducts = ref([]); // Produk yang sudah disortir untuk ditampilkan
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
    const qrCode = qrcodeImage;
    const isSortMenuOpen = ref(false);
    const isSearchExpanded = ref(false);
    const sortButton = ref(null);
    const dropdownMenu = ref(null);
    const searchInput = ref(null);
    const showPromoDialog = ref(false);
    const promoCode = ref("");
    const promoDiscount = ref(0);

    const filterLabel = computed(() => {
      switch (filter.value) {
        case "all":
          return "Semua";
        case "food":
          return "Makanan";
        case "drink":
          return "Minuman";
        default:
          return "Semua"; // Default fallback
      }
    });

    const validPromoCodes = {
      "DISKON10": 10,
      "DISKON20": 20,
      "FREESHIP": 15
    };

    const logActivity = async (activityCode, description = null) => {
      if (loggedInUser.value) {
        const statusChangesRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
        try {
          await push(statusChangesRef, {
            type: "activity", // Tambahkan tipe untuk membedakan dari status
            code: activityCode,
            timestamp: new Date().toISOString(),
            ...(description && { description }),
          });
          console.log(`Activity ${activityCode} logged for ${loggedInUser.value}`);
        } catch (error) {
          console.error("Error logging activity:", error);
        }
      }
    };

    // Fungsi untuk test koneksi (A001)
    const testConnection = async () => {
      try {
        const usersRef = dbRef(db, "users");
        await get(usersRef); // Coba akses Firebase untuk test koneksi
        toast.add({
          severity: "success",
          summary: "Connection Test",
          detail: "Connection to Firebase is successful.",
          life: 3000,
        });
        await logActivity("A001"); // Log aktivitas A001
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Connection Test",
          detail: "Failed to connect to Firebase.",
          life: 3000,
        });
      }
    }

    const getDiscountedPrice = (product) => {
      if (product.discount && product.discount > 0) {
        return Math.round(product.price * (1 - product.discount / 100));
      }
      return product.price;
    };

    // Hitung stok tersedia dengan memperhitungkan item di keranjang
    const getAvailableStock = (product) => {
      const cartItem = cartItems.value.find((item) => item.product.id === product.id);
      const cartQuantity = cartItem ? cartItem.quantity : 0;
      return product.stock - cartQuantity;
    };

    const totalPaymentWithPromo = computed(() => {
      const subtotal = cartItems.value.reduce((total, item) => {
        const price = getDiscountedPrice(item.product);
        return total + price * item.quantity;
      }, 0);
      return Math.round(subtotal * (1 - promoDiscount.value / 100));
    });

    const resetInactivityTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      if (!isLoadingPayment.value) {
        inactivityTimeout = setTimeout(() => {
          refreshApp();
        }, inactivityDuration);
      }
    };

    const refreshApp = () => {
      if (!isLoadingPayment.value) {
        console.log("Refreshing app due to inactivity...");
        filter.value = "all";
        searchQuery.value = "";
        isDrawerVisible.value = false;
        isCartDrawerVisible.value = false;
        isSortMenuOpen.value = false;
        isSearchExpanded.value = false;
        cartItems.value = [];
        cartCount.value = 0;
        totalPayment.value = 0;
        if (searchInput.value) searchInput.value.$el.blur();
        fetchData();
        window.scrollTo(0,0); 
        logActivity("A002"); 
      }
    };

    const fetchData = async () => {
      const promosRef = dbRef(db, "promos");
      onValue(promosRef, (snapshot) => {
        const fetchedPromos = snapshot.val();
        promos.value = fetchedPromos
          ? Object.values(fetchedPromos).filter((item) => item && item.image && item.name)
          : [];
      });

      const productsRef = dbRef(db, "products");
      onValue(productsRef, (snapshot) => {
        const fetchedProducts = snapshot.val();
        products.value = fetchedProducts
          ? Object.values(fetchedProducts).filter((item) => item && item.image && item.name)
          : [];
        updateSortedProducts();
      });

      // Update status ke S001 saat halaman home dimuat
      if (loggedInUser.value) {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        const statusChangeRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);

        try {
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            await set(userRef, {
              username: loggedInUser.value,
              password: userData.password,
              status: "S001",
              statusChanges: userData.statusChanges || {}, // Pertahankan history lama
            });

            await push(statusChangeRef, {
              status: "S001",          
              timestamp: new Date().toISOString(),
            });

          }
        } catch (error) {
          console.error("Error setting status to S001:", error);
        }
      }
    };

    const updateSortedProducts = () => {
      let results = [...products.value];
      if (filter.value !== "all") {
        results = results.filter((product) =>
          filter.value === "food" ? product.image.includes("food") : product.image.includes("drink")
        );
      }
      if (searchQuery.value.trim() !== "") {
        results = results.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      // Sortir berdasarkan stok awal dari Firebase, bukan stok tersedia real-time
      sortedProducts.value = results.sort((a, b) => b.stock - a.stock);
    };

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    const toggleSearch = () => {
      isSearchExpanded.value = !isSearchExpanded.value;
      resetInactivityTimer();
      if (!isSearchExpanded.value && searchInput.value) {
        searchInput.value.$el.blur();
      }
    };

    const toggleSortMenu = () => {
      isSortMenuOpen.value = !isSortMenuOpen.value;
      resetInactivityTimer();
      if (isSortMenuOpen.value && sortButton.value && dropdownMenu.value) {
        const buttonWidth = sortButton.value.offsetWidth;
        dropdownMenu.value.style.width = `${buttonWidth}px`;
      }
    };

    const selectSort = (type) => {
      filter.value = type;
      isSortMenuOpen.value = false;
      updateSortedProducts(); // Sortir hanya saat memilih filter
      resetInactivityTimer();
      setTimeout(() => {
        const productGrid = document.getElementById("featured-products");
        if (productGrid) {
          productGrid.scrollIntoView({ behavior: "smooth" });
        }
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
      if (newCount > 0) {
        startWiggleAnimation();
      } else if (wiggleInterval) {
        clearInterval(wiggleInterval);
      }
    });

    watch(
      () => sortButton.value?.offsetWidth,
      (newWidth) => {
        if (isSortMenuOpen.value && dropdownMenu.value && newWidth) {
          dropdownMenu.value.style.width = `${newWidth}px`;
        }
      }
    );

    const isInCart = (product) => {
      return cartItems.value.some((item) => item.product.id === product.id);
    };

    const responsiveOptions = ref([
      { breakpoint: "1400px", numVisible: 1, numScroll: 1 },
      { breakpoint: "1199px", numVisible: 1, numScroll: 1 },
      { breakpoint: "767px", numVisible: 1, numScroll: 1 },
      { breakpoint: "575px", numVisible: 1, numScroll: 1 },
    ]);

    const getSeverity = (status) => {
      switch (status) {
        case "INSTOCK": return "success";
        case "LOWSTOCK": return "warn";
        case "OUTOFSTOCK": return "danger";
        default: return null;
      }
    };

    const addToCart = (product) => {
      if (getAvailableStock(product) <= 0) {
        toast.add({
          severity: "warn",
          summary: "Out of Stock",
          detail: `${product.name} is out of stock.`,
          life: 3000
        });
        return;
      }
      const existingItem = cartItems.value.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
          cartCount.value += 1; 
          logActivity("A004", `Rak ${product.rak}`);          
        } else {
          toast.add({
            severity: "warn",
            summary: "Stock Limit Reached",
            detail: `Cannot add more ${product.name}. Stock limit reached.`,
            life: 3000
          });
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
      const cartIcon = document.querySelector(".cart-button");
      if (!cartIcon) return;
      const cartRect = cartIcon.getBoundingClientRect();
      const animatingElem = document.createElement("div");
      animatingElem.className = "animating-product";
      animatingElem.style.backgroundImage = `url(${product.image})`;
      animatingElem.style.position = "fixed";
      animatingElem.style.width = "50px";
      animatingElem.style.height = "50px";
      animatingElem.style.borderRadius = "100%";
      animatingElem.style.backgroundSize = "cover";
      animatingElem.style.left = `${clientX}px`;
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
      logActivity("A004", `Rak ${product.rak}`);     
    };

    const increaseQuantity = (item) => {
      if (getAvailableStock(item.product) > item.quantity) {
        item.quantity += 1;
        cartCount.value += 1;
        calculateTotalPayment();
        resetInactivityTimer();        
        logActivity("A004", `Rak ${product.rak}`);     
      } else {
        toast.add({
          severity: "warn",
          summary: "Stock Limit Reached",
          detail: `Cannot add more ${item.product.name}. Stock limit reached.`,
          life: 3000
        });
      }
    };

    const proceedToPayment = async () => {
      isLoadingPayment.value = true;
      clearTimeout(inactivityTimeout);
      setTimeout(() => {
        showQRCode.value = true;
      }, 3000);
      setTimeout(async () => {
        showPaymentSuccessModal.value = true;

        try {
          for (const item of cartItems.value) {
            const productRef = dbRef(db, `products/${item.product.id}`);
            const newStock = item.product.stock - item.quantity;
            const updatedInventoryStatus = determineInventoryStatus(newStock);

            await update(productRef, {
              stock: newStock >= 0 ? newStock : 0,
              inventoryStatus: updatedInventoryStatus
            });
          }
          toast.add({
            severity: "success",
            summary: "Stock Updated",
            detail: "Product stock has been updated successfully.",
            life: 3000
          });

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
            usedVoucher: promoDiscount.value > 0 ? true : false,
            voucherDiscount: promoDiscount.value
          };
          await set(newReceiptRef, receiptData);
          toast.add({
            severity: "success",
            summary: "Receipt Saved",
            detail: "Transaction receipt has been saved.",
            life: 3000
          });

          await logActivity("A005");

          for (const item of cartItems.value) {
            const rakNumber = String(item.product.rak).padStart(3, "0"); // Misal rak 5 jadi "005"
            const activityCode = `Q${rakNumber}`; // Q005 untuk rak 5
            const description = `OUT:${item.product.name}`;

            // Ulangi log sesuai quantity
            for (let i = 0; i < item.quantity; i++) {
              console.log(`Logging activity ${activityCode} for ${description}`);
              await logActivity(activityCode, description);
            }
          }

          // Update sorting setelah checkout
          updateSortedProducts();
        } catch (error) {
          console.error("Error during payment:", error);
          toast.add({
            severity: "error",
            summary: "Payment Error",
            detail: "Failed to process payment or save receipt.",
            life: 3000
          });
        }

        cartItems.value = [];
        cartCount.value = 0;
        totalPayment.value = 0;
        promoDiscount.value = 0;
        toggleCartDrawer();
        isLoadingPayment.value = false;
        showQRCode.value = false;
        resetInactivityTimer();
      }, 6000);
    };

    const determineInventoryStatus = (stock) => {
      if (stock > 5) return "INSTOCK";
      if (stock > 0 && stock <= 5) return "LOWSTOCK";
      return "OUTOFSTOCK";
    };

    const toggleCartDrawer = () => {
      isCartDrawerVisible.value = !isCartDrawerVisible.value;
      if (isCartDrawerVisible.value && cartCount.value > 0){
        logActivity("A003");
      } 
      resetInactivityTimer();
    };

    // Ganti filteredProducts menjadi computed yang hanya menampilkan sortedProducts
    const filteredProducts = computed(() => {
      return sortedProducts.value;
    });

    const openDrawer = (product) => {
      selectedProduct.value = product;
      isDrawerVisible.value = true;
      resetInactivityTimer();
    };

    const closeDrawer = () => {
      isDrawerVisible.value = false;
      resetInactivityTimer();
    };

    watch(searchQuery, (newVal) => {
      if (newVal && isSearchExpanded.value) {
        updateSortedProducts(); // Sortir saat pencarian berubah
        resetInactivityTimer();
      }
    });

    watch(isSortMenuOpen, (newVal) => {
      if (newVal && sortButton.value && dropdownMenu.value) {
        const buttonWidth = sortButton.value.offsetWidth;
        dropdownMenu.value.style.width = `${buttonWidth}px`;
      }
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


    onMounted(() => {
      fetchData();
      resetInactivityTimer();
      testConnection(); 
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      if (cartCount.value > 0) startWiggleAnimation();
      if (isSortMenuOpen.value && sortButton.value && dropdownMenu.value) {
        const buttonWidth = sortButton.value.offsetWidth;
        dropdownMenu.value.style.width = `${buttonWidth}px`;
      }
    });

    onUnmounted(() => {
      if (wiggleInterval) clearInterval(wiggleInterval);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    });

    return {
      loggedInUser,
      isSearchExpanded,
      toggleSearch,
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
      sortedProducts, // Tambahkan untuk debugging jika perlu
      selectSort,
      isSortMenuOpen,
      toggleSortMenu,
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
      qrCode,
      animateProductToCart,
      closeDrawer,
      searchInput,
      sortButton,
      dropdownMenu,
      totalPaymentWithPromo,
      getDiscountedPrice,
      getAvailableStock,
      showPromoDialog,
      togglePromoDialog,
      promoCode,
      applyPromoCode
    };
  },
};
</script>

<style>
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

button.flex-grow {
  max-width: calc(100% - 2.5rem);
  width: auto;
}

.cart-icon-wrapper {
  display: inline-flex;
  align-items: center;
}

.cart-content {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.text-red-600 {
  color: #dc2626;
}

.text-gray-500 {
  color: #6b7280;
}

.line-through {
  text-decoration: line-through;
}

.pi-ticket {
  font-size: 1.2rem;
}
</style>