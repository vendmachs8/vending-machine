<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="flex items-center justify-between px-4 py-4">
      <h2 
        class="subpixel-antialiased font-semibold text-4xl px-2" 
        id="featured-products">
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
              <InputIcon
                class="pi pi-search cursor-pointer text-gray-700 scale-150 px-1"
              />
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
              <span v-if="cartCount > 0"
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
              <ul v-if="showSortOptions" class="absolute z-50 bg-white border border-gray-50 rounded-3xl shadow-lg mt-2 p-2 w-48">
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
      
            <div class="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide ">
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
          <div class="flex justify-center items-center ">
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
    <Drawer
      v-model:visible="isMenuDrawerVisible"
      position="right"
      style="width: 150px;"
    >
      <template #header>
        <div class="text-2xl font-bold">Menu</div>
      </template>

      <div class="flex flex-col gap-4 text-white text-center">
        <p v-if="loggedInUser" class="text-lg font-semibold mb-1 text-black">
          ID: {{ loggedInUser }}
        </p>
        <button
          @click="navigateTo('/admin')"
          class="w-full py-2 px-4 bg-black rounded-full"
        >
          Admin
        </button>
        <button
          @click="navigateTo('/login')"
          class="w-full py-2 px-4 bg-black rounded-full"        >
          Login
        </button>
        <button
          @click="navigateTo('/status')"
          class="w-full py-2 px-4 bg-black rounded-full"        >
          Status
        </button>
      </div>

    </Drawer>

    <!-- Drawer Pop -->
    <Drawer
      v-model:visible="isDrawerVisible"
      position="bottom"
      style="height: auto;"
    >
      <template #header>
        <p></p>
      </template>
      
      <div v-if="selectedProduct">
        <div class="image-container">
          <img
            :src="selectedProduct.image"
            alt="selectedProduct.name"
            class="product-image"
          />
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
      </div>
    </Drawer>

    <!-- Cart Drawer -->
    <Drawer
      v-model:visible="isCartDrawerVisible"
      position="bottom"
      style="overflow-y: auto; max-height: 85%; height: auto;"
      class="-mb-5"
    >
      <template #header> 
        <div class="text-2xl font-bold">Cart</div>
      </template>
      <div class="p-0">
        <div v-if="cartItems.length > 0">
          <div class="relative overflow-y-auto" >
            <div
          v-for="(item, index) in cartItems"
          :key="index"
          class="flex items-center justify-between bg-white max-h-24 w-full rounded-r-2xl overflow-y-clip my-3" 
          style="border-top-left-radius: 40px; border-bottom-left-radius: 40px;"
        >
          <img
            :src="item.product.image"
            alt="product.name"
            class="w-28 h-28 object-cover rounded-md"
          />
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
              :class="{
                'bg-white border-gray-400' : getAvailableStock(item.product) > 0, 
                'bg-red-200' : getAvailableStock(item.product) <= 0
              }"
              @click="decreaseQuantity(item)"
            >
              <i class="pi pi-minus" />
            </button>
            <span v-if="item.quantity < 10">{{ `0${item.quantity}` }}</span>
            <span v-else>{{ item.quantity }}</span>
            <button
              class="px-1.5 py-0.5 rounded-full"
              :class="{
                'bg-primary-200' : getAvailableStock(item.product) > 0, 
                'bg-gray-400' : getAvailableStock(item.product) <= 0
              }"
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
            <div class="flex justify-between py-3 ">
              <p class="text-gray-400">Sub-total: </p>              
              <p class="font-bold">Rp.{{ originalSubtotal }}</p>
            </div>
            <div class="flex justify-between py-3 ">
              <p class="text-gray-400">Diskon: </p>
              <p class="font-bold text-red-500">Rp.{{ totalDiscount }}</p>
            </div>
            <div class="font-bold flex justify-between border-t-2 border-gray-200 py-3">
              <p>Total: </p>
              <p>Rp.{{ totalPaymentWithPromo }}</p>
            </div>
            
            
            <div class="mt-4">
              <Button
                label="Checkout"
                class="w-full p-button-primary h-16 rounded-full checkout-gradient"
                :loading="isLoadingPayment"
                @click="proceedToPayment"
              />
            </div>  
          </div>
          
        </div>
        <div v-else class="text-center text-gray-500 pb-10">Your cart is empty.</div>
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
  </div>
</template>
<script>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import qrcodeImage from "../assets/qrcode.png";
import { db } from "../firebase";
import { onValue, ref as dbRef, update, push, set, get } from "firebase/database";
import { useToast } from "primevue/usetoast";

export default {
  setup() {
    const router = useRouter();
    let wiggleInterval = null;
    let inactivityTimeout = null;
    const inactivityDuration = 3000000;
    const toast = useToast();
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
    const qrCode = qrcodeImage;
    const searchInput = ref(null);
    const showPromoDialog = ref(false);
    const promoCode = ref("");
    const promoDiscount = ref(0);
    const isMenuDrawerVisible = ref(false);

    const showSortOptions = ref(false);
    const sortBy = ref('default');
    const isSortExtended = ref(false);

    const originalSubtotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        return total + item.product.price * item.quantity; 
      }, 0); 
    });

    const totalDiscount = computed(() => {
      return originalSubtotal.value - totalPaymentWithPromo.value; 
    });

    const toggleSortOption = () => {
      isSortExtended.value = !isSortExtended.value;
      if (isSortExtended.value) {
        showSortOptions.value = true;
      } else {
        showSortOptions.value = false;
      }
      resetInactivityTimer();
    };

    const setSortOption = (option) => {
      sortBy.value = option;
      isSortExtended.value = !isSortExtended.value;
      if (isSortExtended.value) {
        showSortOptions.value = true;
      } else {
        showSortOptions.value = false;
      }
      updateSortedProducts();
      resetInactivityTimer();
    };

    const filterLabel = computed(() => {
      switch (filter.value) {
        case "all": return "Semua";
        case "food": return "Makanan";
        case "drink": return "Minuman";
        default: return "Semua";
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
            type: "activity",
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

    const testConnection = async () => {
      try {
        const usersRef = dbRef(db, "users");
        await get(usersRef);
        toast.add({ severity: "success", summary: "Connection Test", detail: "Connection to Firebase is successful.", life: 3000 });
        await logActivity("A001");
      } catch (error) {
        toast.add({ severity: "error", summary: "Connection Test", detail: "Failed to connect to Firebase.", life: 3000 });
      }
    };

    const getDiscountedPrice = (product) => {
      if (product.discount && product.discount > 0) {
        return Math.round(product.price * (1 - product.discount / 100));
      }
      return product.price;
    };

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
        isMenuDrawerVisible.value = false;
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

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    const selectSort = (type) => {
      filter.value = type;
      updateSortedProducts();
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
          toast.add({ severity: "warn", summary: "Stock Limit Reached", detail: `Cannot add more ${product.name}. Stock limit reached.`, life: 3000 });
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
      animatingElem.style.left = `${clientX-20}px`;
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
        toast.add({ severity: "warn", summary: "Stock Limit Reached", detail: `Cannot add more ${item.product.name}. Stock limit reached.`, life: 3000 });
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
          toast.add({ severity: "success", summary: "Stock Updated", detail: "Product stock has been updated successfully.", life: 3000 });

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
          toast.add({ severity: "success", summary: "Receipt Saved", detail: "Transaction receipt has been saved.", life: 3000 });

          await logActivity("A005");

          for (const item of cartItems.value) {
            const rakNumber = String(item.product.rak).padStart(3, "0");
            const activityCode = `Q${rakNumber}`;
            const description = `OUT:${item.product.name}`;
            for (let i = 0; i < item.quantity; i++) {
              console.log(`Logging activity ${activityCode} for ${description}`);
              await logActivity(activityCode, description);
            }
          }

          updateSortedProducts();
        } catch (error) {
          console.error("Error during payment:", error);
          toast.add({ severity: "error", summary: "Payment Error", detail: "Failed to process payment or save receipt.", life: 3000 });
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
        document.body.classList.add("drawer-open"); 
      } else {
        document.body.classList.remove("drawer-close"); 
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

    onMounted(() => {
      fetchData();
      resetInactivityTimer();
      testConnection();
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
      qrCode,
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
      navigateTo
    };
  },
};
</script>

<style>
/* Tambahkan class ini di style section yang sudah ada */
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
  0% {
    background-position: 0% 25%;
  }
  50% {
    background-position: 100% 75%;
  }
  100% {
    background-position: 0% 25%;
  }
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

/* Styling untuk scroll horizontal */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Styling untuk tombol sort */
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

.sort-button.extended {
  width: 120px;
}

.sort-button .text {
  display: inline-block;
  margin-left: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sort-button.extended .text {
  opacity: 1;
}

</style>

