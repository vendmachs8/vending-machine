<template >
  <div class="min-h-screen bg-gray-50">
    <!-- Header and Content -->
    <header class="w-full">
      <!-- Location Bar  -->
      <div class="pt-3 px-8 text-sm text-gray-500">
        <p>
          <i class="pi pi-map-marker mr-1" style="font-size: smaller"></i>Lokasi
          : Universitas Brawijaya
        </p>
      </div>
      <div class="pb-4 pt-2 flex items-center justify-center">
        <!-- Search Bar -->
        <div class="flex items-center mx-auto gap-4">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Search Products"
              class="w-[16rem] md:w-[44rem]"
            />
          </IconField>
          <!-- CART ORIGINAL -->
          <!-- <button class="mt-3" @click="toggleCartDrawer">
            <OverlayBadge :value="cartCount" v-if="cartCount > 0">
              <i class="pi pi-shopping-cart" style="font-size: 1.75rem" />
            </OverlayBadge>
            <i v-else class="pi pi-shopping-cart" style="font-size: 1.75rem" />
          </button> -->
        </div>
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
        :autoplayInterval="1000"
      >
        <template #item="slotProps">
          <div
            class="border border-surface-200 dark:border-surface-700 rounded-2xl"
          >
            <div class="relative mx-auto">
              <img
                :src="
                  slotProps.data.image ? slotProps.data.image : productImage
                "
                :alt="slotProps.data.name"
                class="w-full h-40 object-cover rounded-2xl"
              />
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <!-- Featured Products -->
    <section class="container mx-auto px-4 py-6">
      <h2 class="text-xl font-semibold md-4" id="featured-products">Featured Products</h2>
      <!-- Tombol Navigasi (Baru di atas, sticky) -->
      <!-- <div class="sticky top-0 z-50 bg-white border-b-2">
        <div class="flex font-bold justify-around py-2 px-4">
          <button
            @click="filterProducts('all')"
            :class="[
              'px-4 py-2 text-sm transition-colors',
              filter === 'all' ? 'bg-blue-500 text-white px-8' : 'bg-gray-50 text-gray-700'
            ]"
          >
            Semua
          </button>
          <button
            @click="filterProducts('food')"
            :class="[
              'px-4 py-2 text-sm transition-colors',
              filter === 'food' ? 'bg-blue-500 text-white px-8' : 'bg-gray-50 text-gray-700'
            ]"
          >
            Makanan
          </button>
          <button
            @click="filterProducts('drink')"
            :class="[
              'px-4 py-2 text-sm transition-colors',
              filter === 'drink' ? 'bg-blue-500 text-white px-8' : 'bg-gray-50 text-gray-700'
            ]"
          >
            Minuman
          </button>
        </div>
      </div> -->

      <!-- Tombol Sortir (Sticky) -->
      <div class="sticky top-0 z-50 bg-white shadow-lg">
        <div class="relative py-2 px-4">
          <button
            @click="toggleSortMenu"
            class="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-orange-500 rounded-md transition-colors hover:bg-orange-600"
          >
            <i class="pi pi-sort-alt mr-2"></i>
            <span>Urutkan</span>
            <i class="pi pi-angle-down ml-2"></i>
          </button>
          <!-- Dropdown Menu -->
          <div
            v-if="isSortMenuOpen"
            class="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-10"
          >
            <button
              @click="selectSort('all')"
              class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Semua
            </button>
            <button
              @click="selectSort('food')"
              class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Makanan
            </button>
            <button
              @click="selectSort('drink')"
              class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Minuman
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <!-- <div class="flex gap-2 mb-6">
        <Button
          label="All"
          :style="{
            backgroundColor: filter === 'all' ? 'var(--p-primary-400)' : '',
            color: filter === 'all' ? 'white' : '',
          }"
          class="p-button-secondary"
          @click="filterProducts('all')"
        />
        <Button
          label="Food"
          :style="{
            backgroundColor: filter === 'food' ? 'var(--p-primary-400)' : '',
            color: filter === 'food' ? 'white' : '',
          }"
          class="p-button-secondary"
          @click="filterProducts('food')"
        />
        <Button
          label="Drink"
          :style="{
            backgroundColor: filter === 'drink' ? 'var(--p-primary-400)' : '',
            color: filter === 'drink' ? 'white' : '',
          }"
          class="p-button-secondary"
          @click="filterProducts('drink')"
        />
      </div> -->

      <!-- Drawer Product   -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 ">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="[
            'relative transition ease-in-out delay-150 hover:shadow-2xl duration-300  shadow-grey-500 border-none border-surface-200 dark:border-surface-700 bg-azure rounded-2xl p-3 flex flex-col justify-between h-full rainbow-spots',
            { 'opacity-30 shadow-2xl': product.stock === 0 }
          ]"
          @click="openDrawer(product)"
        >
          <div class="flex justify-center items-center ">
            <img
              :src="product.image"
              alt="product.name"
              class="transition ease-in-out delay-150 hover:-translate-y-2 hover:scale-125 duration-300 w-38 h-38 object-cover rounded-full mb-2 "
            />
          </div>

          <Tag
            :value="product.inventoryStatus"
            :severity="getSeverity(product.inventoryStatus)"
            class="rounded-xl -ml-3 mr-auto justify-start"
            style="border-radius: 0 10px 10px 0"
          />

          <h3 class="text-lg font-medium mt-2 text-center">{{ product.name }}</h3>

          <!-- Description, Rack, and Stock -->
          <p class="text-sm text-gray-500 mt-1 text-center">{{ product.desc }}</p>
          <p class="text-sm text-gray-500 mt-1 text-center">
            No.{{ product.rak }} | Stok : {{ product.stock }}
          </p>

          <!-- Price and Cart button in a single row -->
          <div class="flex justify-between items-center mt-2">
            <p class="text-gray-600 font-bold">Rp{{ product.price }}</p>
            <div class="justify-items-end items-end">
              <!-- Add/Increase QuantityButton -->
              <button
              :disabled="product.stock === 0"
              class="text-white px-3 py-2 rounded-xl transition"
              :class="{
                'bg-gray-400 cursor-not-allowed': product.stock === 0, 
                'bg-primary-400 hover:bg-primary-500': product.stock > 0 
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

            <!-- Cancel Button  -->
              <!-- <button
              v-if="isInCart(product)"
              class="text-white px-3 py-2 rounded-xl transition bg-red-500 hover:bg-red-700"
              @click.stop="removeFromCart(product)"
              >
              <i class="pi pi-times"></i>
              </button> -->
            </div>
          </div>

          <!-- Overlay 'Habis' saat out of stock -->
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
        <p class="text-gray-600 font-bold mt-4 text-2xl flex justify-center">
          Rp{{ selectedProduct.price }}
        </p>
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
        <!-- Cart Items -->
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
              <span class="text-sm text-gray-500"
                >Qty: {{ item.quantity }}</span
              >
            </div>

            <!-- Quantity Adjust Buttons -->
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

            <span class="font-bold"
              >Rp{{ item.product.price * item.quantity }}</span
            >
          </div>

          <!-- Total Payment -->
          <div class="text-xl font-bold text-right mt-8">
            Total: Rp.{{ totalPayment }}
          </div>

          <!-- Payment Button -->
          <div class="mt-4">
            <Button
              label="Proceed to Payment"
              class="w-full p-button-primary"
              :loading="isLoadingPayment"
              @click="proceedToPayment"
            />
          </div>
        </div>

        <!-- Empty Cart Message -->
        <div v-else class="text-center text-gray-500">Your cart is empty.</div>
      </div>
    </Drawer>

    <!-- Bottom Navigation (Layar Kecil) -->
    <!-- <div class="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg md:hidden">
      <div class="flex flex-row py-2 px-4 gap-4">
        <button
          @click="filterProducts('all')"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'
          ]"
        > 
        Semua
        </button>

        <button
          @click="filterProducts('food')"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-colors',
            filter === 'food' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'
          ]"
        > 
        Makanan
        </button>

        <button
          @click="filterProducts('drink')"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-colors',
            filter === 'drink' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'
          ]"
        > 
        Minuman
        </button>

      </div>

    </div> -->

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

    <!-- Payment Success Modal Dialog -->
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
    <!-- <Transition name="fade">
      <button 
        v-if="cartCount > 0 && !isCartDrawerVisible"
        @click="toggleCartDrawer"
        class="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-primary-500 text-white hover:bg-primary-600 transition-all duration-300 flex items-center gap-2"
      > 
        
        <i class="pi pi-shopping-cart" style="font-size: 1.5rem;"></i>
        <span class="font-bold">{{ cartCount }}</span>
        <span class="font-bold">TEKAN UNTUK BAYAR</span>
      </button>
    </Transition> -->

    <transition name="pop">
      <button
        v-if="cartCount > 0 && !isCartDrawerVisible"
        @click="toggleCartDrawer"
        class=" fixed bottom-20 right-6 z-50 rounded-full shadow-lg bg-primary-500 text-white hover:bg-primary-600 transition-all duration-300 flex items-center gap-2 cart-button"
        
      >
        <span class="cart-icon-wrapper">
          <i class="pi pi-shopping-cart text-xl" style="font-size: 1.5rem"></i>
        </span>
        <span class="cart-content font-bold">BAYAR</span>
        <span class="cart-count-badge absolute -top-1 -right-1 bg-red-500 text-white text-md font-bold w-8 h-6 flex items-center justify-center rounded-full shadow-md">{{ cartCount }}</span>
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

    const toggleSortMenu = () => {
      isSortMenuOpen.value = !isSortMenuOpen.value; 
    };

    const selectSort = (type) => {
      filter.value = type;
      isSortMenuOpen.value = false; // Tutup menu setelah memilih
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
          void iconWrapper.offsetWidth; // Trigger reflow
          iconWrapper.classList.add('wiggle');
        }
      }, 2000); // Wiggle every 2 seconds
    };

    watch(cartCount, (newCount) => {
      if (newCount > 0) {
        startWiggleAnimation();
      } else if (wiggleInterval) {
        clearInterval(wiggleInterval);
      }
    });

    const isInCart = (product) => {
      return cartItems.value.some((item) => item.product.id === product.id)
    };

    const responsiveOptions = ref([
      {
        breakpoint: "1400px",
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: "1199px",
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: "767px",
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: "575px",
        numVisible: 1,
        numScroll: 1,
      },
    ]);

    const getSeverity = (status) => {
      switch (status) {
        case "INSTOCK":
          return "success";

        case "LOWSTOCK":
          return "warn";

        case "OUTOFSTOCK":
          return "danger";

        default:
          return null;
      }
    };

    const filterProducts = (type) => {
      filter.value = type;

      const productGrid = document.getElementById("featured-products"); 
      if (productGrid) {
        productGrid.scrollIntoView({ behavior: "smooth" });
      }
    };

    const addToCart = (product) => {
      if (product.stock === 0) return; 

      const existingItem = cartItems.value.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        if(existingItem.quantity < product.stock) {
          existingItem.quantity += 1; // Increment quantity if item already in cart
        }
      } else {
        cartItems.value.unshift({ product, quantity: 1 }); // Add new item to cart
      }

      cartCount.value += 1; // Increment cart count
      calculateTotalPayment(); // Recalculate total payment
    };

    const removeFromCart = (product) => {
      const itemIndex = cartItems.value.findIndex(
        (item) => item.product.id === product.id
      );
      if (itemIndex !== -1){
        const item = cartItems.value[itemIndex]; 
        cartCount.value -= item.quantity; 
        cartItems.value.splice(itemIndex, 1); 
        calculateTotalPayment(); 
        // Ensure cartCount doesn't go negative and matches cart contents
        if (cartCount.value < 0) cartCount.value = 0;

        // Optional: Sync cartCount with actual total items
        const totalItems = cartItems.value.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        if (cartCount.value !== totalItems) {
          cartCount.value = totalItems;
        }

        // Close drawer if cart is empty
        if (cartItems.value.length === 0) {
          isCartDrawerVisible.value = false;
        }
      }
    };

    const calculateTotalPayment = () => {
      let total = 0;
      cartItems.value.forEach((item) => {
        total += item.product.price * item.quantity;
      });

      totalPayment.value = total;
    };

    const animateProductToCart = (event, product) => {
      const { clientX, clientY } = event; // Koordinat klik
      const cartIcon = document.querySelector(".cart-button"); // Elemen ikon keranjang

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
      animatingElem.style.zIndex = "1100"; // Pastikan z-index lebih tinggi dari drawer

      document.body.appendChild(animatingElem);

      setTimeout(() => {
        animatingElem.style.left = `${cartRect.left + cartRect.width / 2}px`;
        animatingElem.style.top = `${cartRect.top + cartRect.height / 2}px`;
        animatingElem.style.transform = "scale(0.5)";
        animatingElem.style.opacity = "0";

        // Hapus elemen setelah animasi selesai
        setTimeout(() => {
          document.body.removeChild(animatingElem);
        }, 1000);
      }, 10);
    };

    const decreaseQuantity = (item) => {
      if (item.quantity >= 1) {
        item.quantity -= 1;
        cartCount.value -= 1;
        calculateTotalPayment();
        if (item.quantity === 0) {
          cartItems.value = cartItems.value.filter(
            (cartItem) => cartItem.product.id !== item.product.id
          );
          if (cartItems.value.length === 0) {
            toggleCartDrawer();
          }
        }
      }
    };

    const increaseQuantity = (item) => {
      item.quantity += 1;
      cartCount.value += 1;
      calculateTotalPayment();
    };

    const proceedToPayment = () => {
      // Show the loading animation
      isLoadingPayment.value = true;
      console.log("Proceed to payment");
      console.log("Loading state:", isLoadingPayment.value);

      // First delay of 3 seconds to show QR code
      console.log("Waiting 3 seconds to show QR code...");
      setTimeout(() => {
        console.log("3 seconds passed. Showing QR code...");
        // Show QR code
        showQRCode.value = true;
        console.log("QR Code visible:", showQRCode.value);
      }, 3000); // First 3 seconds delay

      // After 3 more seconds, show the success dialog
      console.log("Waiting 6 seconds to show success modal...");
      setTimeout(() => {
        console.log("6 seconds passed. Showing payment success modal...");
        // Show the modal after the second delay
        showPaymentSuccessModal.value = true;
        console.log(
          "Payment Success Modal visible:",
          showPaymentSuccessModal.value
        );

        // Clear the cart after the modal is shown
        cartItems.value = [];
        cartCount.value = 0;
        totalPayment.value = 0;
        console.log(
          "Cart cleared. Items:",
          cartItems.value,
          "Count:",
          cartCount.value,
          "Total:",
          totalPayment.value
        );

        toggleCartDrawer();

        // Stop the loading animation after the modal is shown
        isLoadingPayment.value = false;
        console.log("Loading state stopped:", isLoadingPayment.value);

        // Hide QR code after modal is shown
        showQRCode.value = false;
        console.log("QR Code hidden:", showQRCode.value);
      }, 6000); // Total 6 seconds delay (3 seconds + 3 seconds)
    };

    const toggleCartDrawer = () => {
      isCartDrawerVisible.value = !isCartDrawerVisible.value;
    };

    const filteredProducts = computed(() => {
      let results = products.value;

      // Filter berdasarkan kategori
      if (filter.value !== "all") {
        results = results.filter((product) =>
          filter.value === "food"
            ? product.image.includes("food")
            : product.image.includes("drink")
        );
      }

      // Filter berdasarkan kata kunci pencarian
      if (searchQuery.value.trim() !== "") {
        results = results.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }

      // return results;
      return results.sort((a,b) => b.stock - a.stock); 
    });

    const openDrawer = (product) => {
      selectedProduct.value = product;
      isDrawerVisible.value = true;
    };

    const closeDrawer = (product) => {
      isDrawerVisible.value = false;
    };

    onMounted(() => {
      // Fetch promos 
      const promosRef = dbRef(db, "promos");
      onValue(promosRef, (snapshot) => {
        const fetchedPromos = snapshot.val();
        promos.value = fetchedPromos
          ? Object.values(fetchedPromos).filter(
              (item) => item && item.image && item.name
            )
          : [];
      });

      // Fetch products
      const productsRef = dbRef(db, "products");
      onValue(productsRef, (snapshot) => {
        const fetchedProducts = snapshot.val();
        products.value = fetchedProducts
          ? Object.values(fetchedProducts).filter(
              (item) => item && item.image && item.name
            )
          : [];
      });

      if(cartCount.value > 0){
        startWiggleAnimation(); 
      }

    });
    
    onUnmounted(() => {
      if (wiggleInterval) clearInterval(wiggleInterval);
    });

    return {
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
      addToCart,
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


</style>
