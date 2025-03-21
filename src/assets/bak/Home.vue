<!--  -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header and Content -->
    <header class="w-full">
      <div class="pt-3 px-8 text-sm text-gray-500 mb-3">
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
        <div class="relative py-2 px-4 flex justify-between items-center gap-4">
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
                :class="{ 'w-0 px-2 py-2': !isSearchExpanded, 'w-48 px-2 py-2 opacity-100': isSearchExpanded }"
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
            <span>Urutkan</span>
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
          <div
            ref="dropdownMenu"
            v-if="isSortMenuOpen"
            class="absolute right-4 top-full mt-1 bg-white shadow-lg rounded-md z-10"
          >
            <button
              @click="selectSort('all')"
              class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Semua
            </button>
            <button
              @click="selectSort('food')"
              class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Makanan
            </button>
            <button
              @click="selectSort('drink')"
              class="block w-full px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Minuman
            </button>
          </div>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="[
            'relative transition ease-in-out delay-150 hover:shadow-2xl duration-300 shadow-grey-500 border-none border-surface-200 dark:border-surface-700 bg-azure rounded-2xl p-3 flex flex-col justify-between h-full rainbow-spots',
            { 'opacity-30 shadow-2xl': product.stock === 0 }
          ]"
          @click="openDrawer(product)"
        >
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
            No.{{ product.rak }} | Stok : {{ product.stock }}
          </p>
          <div class="flex justify-between items-center mt-2">
            <div>
              <!-- Harga dengan diskon -->
              <p v-if="product.discount > 0" class="text-red-600 font-bold">Rp{{ getDiscountedPrice(product) }}</p>
              <p v-if="product.discount > 0" class="text-gray-500 line-through">Rp{{ product.price }}</p>
              <p v-else class="text-gray-600 font-bold">Rp{{ product.price }}</p>
            </div>
            <div class="justify-items-end items-end">
              <button
                :disabled="product.stock === 0"
                class="text-white px-3 py-2 rounded-xl transition"
                :class="{
                  'bg-gray-400 cursor-not-allowed': product.stock === 0,
                  'bg-primary-200 hover:bg-primary-300': product.stock > 0
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
          <div
            v-if="product.stock === 0"
            class="absolute inset-0 flex items-center justify-center"
          >
            <span class="text-2xl font-bold text-black">HABIS</span>
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
          Rak: {{ selectedProduct.rak }} | Stok: {{ selectedProduct.stock }}
        </p>
        <!-- Harga dengan diskon di Drawer -->
        <div class="mt-4 flex justify-center items-center gap-2">
          <p v-if="selectedProduct.discount > 0" class="text-red-600 font-bold text-2xl">Rp{{ getDiscountedPrice(selectedProduct) }}</p>
          <p v-if="selectedProduct.discount > 0" class="text-gray-500 line-through text-lg">Rp{{ selectedProduct.price }}</p>
          <p v-else class="text-gray-600 font-bold text-2xl">Rp{{ selectedProduct.price }}</p>
        </div>
        <button
          class="mt-4 text-white px-4 py-2 rounded-md transition w-full"
          style="background-color: var(--p-primary-500)"
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
                @click="increaseQuantity(item)"
              >
                <i class="pi pi-plus" />
              </button>
            </div>
            <!-- Harga dengan diskon di Cart -->
            <div class="text-right">
              <span v-if="item.product.discount > 0" class="font-bold text-red-600">Rp{{ getDiscountedPrice(item.product) * item.quantity }}</span>
              <span v-if="item.product.discount > 0" class="block text-gray-500 line-through text-sm">Rp{{ item.product.price * item.quantity }}</span>
              <span v-else class="font-bold">Rp{{ item.product.price * item.quantity }}</span>
            </div>
          </div>
          <!-- Total dengan diskon -->
          <div class="text-xl font-bold text-right mt-8">
            Total: Rp.{{ totalPayment }}
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
import { onValue, ref as dbRef } from "firebase/database";
import { useToast } from "primevue/usetoast";

export default {
  setup() {
    let wiggleInterval = null;
    let inactivityTimeout = null;
    const inactivityDuration = 30000;
    const toast = useToast();
    const promos = ref([]);
    const products = ref([]);
    const filter = ref("all");
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

    const validPromoCodes = {
      "DISKON10": 10, 
      "DISKON20": 20, 
      "FREESHIP": 15
    };

    // Fungsi untuk menghitung harga setelah diskon
    const getDiscountedPrice = (product) => {
      if (product.discount && product.discount > 0) {
        return Math.round(product.price * (1 - product.discount / 100));
      }
      return product.price;
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
        // promoCode.value = ""; 
        // promoDiscount.value = 0;
        if (searchInput.value) searchInput.value.$el.blur();
        fetchData();
      }
    };

    const fetchData = () => {
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
      });
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

    const filterProducts = (type) => {
      filter.value = type;
      resetInactivityTimer();
      const productGrid = document.getElementById("featured-products");
      if (productGrid) {
        productGrid.scrollIntoView({ behavior: "smooth" });
      }
    };

    const addToCart = (product) => {
      if (product.stock === 0) return;
      const existingItem = cartItems.value.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
        }
      } else {
        cartItems.value.unshift({ product, quantity: 1 });
      }
      cartCount.value += 1;
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

    // Perbarui perhitungan total untuk mempertimbangkan diskon
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
      if (item.quantity >= 1) {
        item.quantity -= 1;
        cartCount.value -= 1;
        calculateTotalPayment();
        resetInactivityTimer();
        if (item.quantity === 0) {
          cartItems.value = cartItems.value.filter((cartItem) => cartItem.product.id !== item.product.id);
          if (cartItems.value.length === 0) toggleCartDrawer();
        }
      }
    };

    const increaseQuantity = (item) => {
      item.quantity += 1;
      cartCount.value += 1;
      calculateTotalPayment();
      resetInactivityTimer();
    };

    const proceedToPayment = () => {
      isLoadingPayment.value = true;
      clearTimeout(inactivityTimeout);
      setTimeout(() => {
        showQRCode.value = true;
      }, 3000);
      setTimeout(() => {
        showPaymentSuccessModal.value = true;
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

    const toggleCartDrawer = () => {
      isCartDrawerVisible.value = !isCartDrawerVisible.value;
      resetInactivityTimer();
    };

    const filteredProducts = computed(() => {
      let results = products.value;
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
      return results.sort((a, b) => b.stock - a.stock);
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
      console.log("togglePromoDialog");
      resetInactivityTimer();
    };

    const applyPromoCode = () => {
      const code = promoCode.value.trim().toUpperCase();
      if (validPromoCodes[code]) {
        promoDiscount.value = validPromoCodes[code];
        toast.add({ severity: "success", summary: "Success", detail: "Promo code applied!", life: 3000 });
        showPromoDialog.value = false;
      } else {
        console.log("error");
        toast.add({ severity: "error", summary: "Error", detail: "Invalid promo code", life: 3000 });
      }
      promoCode.value = ""; // Reset input setelah digunakan
    };

    onMounted(() => {
      fetchData();
      resetInactivityTimer();
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      if (cartCount.value > 0) startWiggleAnimation();
    });

    onUnmounted(() => {
      if (wiggleInterval) clearInterval(wiggleInterval);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    });

    return {
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
      filteredProducts,
      filterProducts,
      isSortMenuOpen,
      toggleSortMenu,
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
      qrCode,
      animateProductToCart,
      closeDrawer,
      searchInput,
      sortButton,
      dropdownMenu,
      totalPaymentWithPromo, 
      getDiscountedPrice,
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

/* Button Styling */
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

/* Cart Icon Animation */
.cart-icon-wrapper {
  display: inline-flex;
  align-items: center;
}

/* Content Transition */
.cart-content {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

/* Styling untuk harga diskon */
.text-red-600 {
  color: #dc2626; /* Merah untuk harga diskon */
}

.text-gray-500 {
  color: #6b7280; /* Abu-abu untuk harga asli */
}

.line-through {
  text-decoration: line-through;
}

.pi-ticket {
  font-size: 1.2rem;
}


</style>