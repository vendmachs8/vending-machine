<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="w-full relative">
      <div class="pt-3 px-8 text-sm text-gray-500">
        <p v-if="loggedInUser" class="text-lg font-semibold text-gray-700 mb-1">
          Hai {{ loggedInUser }}
        </p>
        <p>
          <i class="pi pi-map-marker mr-1" style="font-size: smaller"></i>Lokasi
          : Universitas Brawijaya
        </p>
        <!-- Tambahkan Device ID Management -->
        <div class="mt-2">
          <label for="deviceId" class="text-sm font-medium">Device ID:</label>
          <InputText
            id="deviceId"
            v-model="deviceId"
            class="ml-2 w-32"
            placeholder="e.g., QrtVB-8888"
            :disabled="loadingDeviceId"
          />
          <Button
            label="Save"
            class="ml-2 p-button-primary"
            @click="saveDeviceId"
            :loading="loadingDeviceId"
          />
        </div>
      </div>

      <div class="absolute top-3 right-8 flex gap-2">
        <button
          @click="goToRun"
          class="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition"
        >
          Run
        </button>
        <button
          @click="goToLogin"
          class="text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md transition"
        >
          Login
        </button>
      </div>

      <div class="pb-4 pt-2 flex items-center justify-center">
        <div class="flex items-center mx-auto gap-4">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Search Products"
              class="w-[16rem] md:w-[44rem]"
            />
          </IconField>
          <button class="mt-3" @click="toggleCartDrawer">
            <OverlayBadge :value="cartCount" v-if="cartCount > 0">
              <i class="pi pi-shopping-cart" style="font-size: 1.75rem" />
            </OverlayBadge>
            <i v-else class="pi pi-shopping-cart" style="font-size: 1.75rem" />
          </button>
        </div>
      </div>
    </header>

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
          <div class="border border-surface-200 dark:border-surface-700 rounded-2xl">
            <div class="relative mx-auto">
              <img
                :src="slotProps.data.image ? slotProps.data.image : productImage"
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
      <h2 class="text-xl font-semibold mb-4">Featured Products</h2>

      <div class="flex justify-between">
        <div class="flex gap-2 mb-6">
          <Button
            label="All"
            :style="{ backgroundColor: filter === 'all' ? 'var(--p-primary-400)' : '', color: filter === 'all' ? 'white' : '' }"
            class="p-button-secondary"
            @click="filterProducts('all')"
          />
          <Button
            label="Food"
            :style="{ backgroundColor: filter === 'food' ? 'var(--p-primary-400)' : '', color: filter === 'food' ? 'white' : '' }"
            class="p-button-secondary"
            @click="filterProducts('food')"
          />
          <Button
            label="Drink"
            :style="{ backgroundColor: filter === 'drink' ? 'var(--p-primary-400)' : '', color: filter === 'drink' ? 'white' : '' }"
            class="p-button-secondary"
            @click="filterProducts('drink')"
          />
        </div>
        <div class="flex gap-2 mb-6">
          <button @click="openReceiptsDialog" class="p-button">
            <i class="pi pi-file"></i> View Receipts
          </button>
          <button @click="openAddNewProductDialog" class="p-button">
            <i class="pi pi-plus"></i> New Item
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="relative border border-surface-200 dark:border-surface-700 bg-white rounded-2xl p-3 hover:shadow-lg transition"
        >
          <div class="flex justify-center items-center">
            <img :src="product.image" alt="product.name" class="w-38 h-38 object-cover rounded-md mb-2" />
          </div>
          <Tag
            :value="product.inventoryStatus"
            :severity="getSeverity(product.inventoryStatus)"
            class="rounded-xl -ml-3 mt-3"
            style="border-radius: 0 10px 10px 0"
          />
          <h3 class="text-lg font-medium mt-2">{{ product.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ truncateDescription(product.desc) }}</p>
          <p class="text-sm text-gray-500 mt-1">No.{{ product.rak }} | Stok : {{ product.stock }}</p>
          <div class="flex justify-between items-center mt-2">
            <div>
              <p v-if="product.discount > 0" class="text-red-600 font-bold">Rp{{ getDiscountedPrice(product) }}</p>
              <p v-if="product.discount > 0" class="text-gray-500 line-through">Rp{{ product.price }}</p>
              <p v-else class="text-gray-600 font-bold">Rp{{ product.price }}</p>
            </div>
            <div class="justify-end">
              <button class="text-black px-2 py-1 rounded-xl" @click.stop="editProduct(product)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="text-red-500 px-2 py-1 rounded-xl" @click.stop="deleteProduct(product)">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Edit Product Dialog -->
    <Dialog v-model:visible="isEditDialogVisible" header="Edit Product" modal class="w-[80%] lg:w-[25%]">
      <div class="p-4">
        <div class="mb-3">
          <label for="productImage" class="block text-sm font-medium mb-1">Product Image</label>
          <!-- Tampilkan gambar yang sudah ada -->
          <div v-if="selectedProduct?.image" class="mb-2">
            <img :src="selectedProduct.image" alt="Current Product Image" class="w-32 h-32 object-cover rounded-md" />
            <p class="text-sm text-gray-500">Current Image</p>
          </div>
          <FileUpload 
            id="productImage" 
            @select="onFileChange" 
            accept="image/*" 
            class="w-full" 
            mode="basic" 
            :chooseLabel="selectedProduct?.image ? 'Change Image' : 'Choose Image'"
          />
        </div>
        <div class="mb-3">
          <label for="productName" class="block text-sm font-medium mb-1">Product Name</label>
          <InputText id="productName" v-model="selectedProduct.name" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productDesc" class="block text-sm font-medium mb-1">Description</label>
          <InputText id="productDesc" v-model="selectedProduct.desc" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productPrice" class="block text-sm font-medium mb-1">Price</label>
          <InputNumber id="productPrice" v-model="selectedProduct.price" mode="currency" currency="IDR" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productDiscount" class="block text-sm font-medium mb-1">Discount (%)</label>
          <InputNumber
            id="productDiscount"
            v-model="selectedProduct.discount"
            class="w-full"
            :min="0"
            :max="100"
            placeholder="0"
          />
        </div>
        <div class="mb-3">
          <label for="productRak" class="block text-sm font-medium mb-1">Rak</label>
          <InputNumber id="productRak" v-model="selectedProduct.rak" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productStock" class="block text-sm font-medium mb-1">Stock</label>
          <InputNumber id="productStock" v-model="selectedProduct.stock" class="w-full" />
        </div>
        <div class="flex justify-end mt-8 gap-2">
          <Button label="Cancel" class="p-button-secondary" @click="cancelEdit" />
          <Button label="Save" class="p-button-primary" @click="saveProduct" :loading="loading" />
        </div>
      </div>
    </Dialog>

    <!-- Add New Product Dialog -->
    <Dialog v-model:visible="isAddNewDialogVisible" header="Add New Product" modal class="w-[80%] lg:w-[25%]">
      <div class="p-4">
        <div class="mb-3">
          <label for="productImage" class="block text-sm font-medium mb-1">Product Image</label>
          <FileUpload id="productImage" @select="onFileChange" accept="image/*" class="w-full" mode="basic" />
        </div>
        <div class="mb-3">
          <label for="productName" class="block text-sm font-medium mb-1">Product Name</label>
          <InputText id="productName" v-model="newProduct.name" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productDesc" class="block text-sm font-medium mb-1">Description</label>
          <InputText id="productDesc" v-model="newProduct.desc" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productPrice" class="block text-sm font-medium mb-1">Price</label>
          <InputNumber id="productPrice" v-model="newProduct.price" mode="currency" currency="IDR" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productDiscount" class="block text-sm font-medium mb-1">Discount (%)</label>
          <InputNumber
            id="productDiscount"
            v-model="newProduct.discount"
            class="w-full"
            :min="0"
            :max="100"
            placeholder="0"
          />
        </div>
        <div class="mb-3">
          <label for="productRak" class="block text-sm font-medium mb-1">Rak</label>
          <InputNumber id="productRak" v-model="newProduct.rak" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="productStock" class="block text-sm font-medium mb-1">Stock</label>
          <InputNumber id="productStock" v-model="newProduct.stock" class="w-full" />
        </div>
        <div class="flex justify-end mt-8 gap-2">
          <Button label="Cancel" class="p-button-secondary" @click="closeAddNewProductDialog" />
          <Button label="Save" class="p-button-primary" @click="saveNewProduct" :loading="loading" />
        </div>
      </div>
    </Dialog>

    <!-- Receipts Dialog -->
    <Dialog v-model:visible="isReceiptsDialogVisible" header="Transaction Receipts" modal class="w-[90%] lg:w-[50%]">
      <div class="p-4">
        <div class="flex justify-between mb-4">
          <Button
            :label="sortOrder === 'desc' ? 'Sort: Newest First' : 'Sort: Oldest First'"
            class="p-button-secondary"
            @click="toggleSortOrder"
          />
          <Button label="Delete All Receipts" class="p-button-danger" @click="deleteAllReceipts" :disabled="receipts.length === 0" />
        </div>
        <div v-if="sortedReceipts.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th class="px-2 py-2">Time</th>
                <th class="px-2 py-2">Items</th>
                <th class="px-2 py-2">Grand Total</th>
                <th class="px-2 py-2">Voucher</th>
                <th class="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="receipt in sortedReceipts" :key="receipt.id" class="bg-white border-b">
                <td class="px-2 py-2">{{ new Date(receipt.timestamp).toLocaleString() }}</td>
                <td class="px-2 py-2">
                  <ul>
                    <li v-for="item in receipt.items" :key="item.id">
                      {{ item.name }} (ID: {{ item.id }}) - Qty: {{ item.quantity }}, Price: Rp{{ item.price }}, Total: Rp{{ item.totalPrice }}, Rak: {{ item.rak }}, Disc: {{ item.discount }}%
                    </li>
                  </ul>
                </td>
                <td class="px-2 py-2">Rp{{ receipt.grandTotal }}</td>
                <td class="px-2 py-2">{{ receipt.usedVoucher ? `Yes (${receipt.voucherDiscount}%)` : 'No' }}</td>
                <td class="px-2 py-2 flex gap-2">
                  <button class="text-red-500" @click="deleteReceipt(receipt)">
                    <i class="pi pi-trash"></i>
                  </button>
                  <button class="text-blue-500" @click="downloadReceiptAsPDF(receipt)">
                    <i class="pi pi-download"></i>
                  </button>
                  <button class="text-green-500" @click="showReceiptQRCode(receipt)">
                    <i class="pi pi-qrcode"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500">No receipts available.</div>
      </div>
    </Dialog>

    <!-- Drawer -->
    <Drawer v-model:visible="isDrawerVisible" position="bottom" style="height: auto">
      <template #header>
        <div v-if="selectedProduct" class="text-2xl font-bold">{{ selectedProduct.name }}</div>
      </template>
      <div v-if="selectedProduct" class="p-4">
        <img :src="selectedProduct.image" alt="selectedProduct.name" class="w-full h-full object-cover rounded-md mb-4" />
        <p class="text-sm text-gray-500 mt-2">{{ selectedProduct.desc }}</p>
        <p class="text-sm text-gray-500 mt-2">Rak: {{ selectedProduct.rak }} | Stok: {{ selectedProduct.stock }}</p>
        <div class="mt-4 flex justify-center items-center gap-2">
          <p v-if="selectedProduct.discount > 0" class="text-red-600 font-bold text-2xl">Rp{{ getDiscountedPrice(selectedProduct) }}</p>
          <p v-if="selectedProduct.discount > 0" class="text-gray-500 line-through text-lg">Rp{{ selectedProduct.price }}</p>
          <p v-else class="text-gray-600 font-bold text-2xl">Rp{{ selectedProduct.price }}</p>
        </div>
        <button
          class="mt-4 text-white px-4 py-2 rounded-md transition w-full"
          style="background-color: var(--p-primary-500)"
          @click="(event) => { closeDrawer(selectedProduct); animateProductToCart(event, selectedProduct); addToCart(selectedProduct); }"
        >
          <i class="pi pi-shopping-cart mr-2"></i> Add to Cart
        </button>
      </div>
    </Drawer>

    <!-- Cart Drawer -->
    <Drawer v-model:visible="isCartDrawerVisible" position="bottom" style="height: auto; overflow-y: auto">
      <template #header>
        <div class="text-2xl font-bold">Your Cart</div>
      </template>
      <div class="p-4">
        <div v-if="cartItems.length > 0">
          <div v-for="(item, index) in cartItems" :key="index" class="flex items-center justify-between mb-4">
            <img :src="item.product.image" alt="product.name" class="w-12 h-12 object-cover rounded-md" />
            <div class="flex flex-col">
              <span class="font-medium">{{ item.product.name }}</span>
              <span class="text-sm text-gray-500">Qty: {{ item.quantity }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-2 bg-gray-200 rounded-md" @click="decreaseQuantity(item)">
                <i class="pi pi-minus" />
              </button>
              <button class="p-2 bg-gray-200 rounded-md" @click="increaseQuantity(item)">
                <i class="pi pi-plus" />
              </button>
            </div>
            <div class="text-right">
              <span v-if="item.product.discount > 0" class="font-bold text-red-600">Rp{{ getDiscountedPrice(item.product) * item.quantity }}</span>
              <span v-if="item.product.discount > 0" class="block text-gray-500 line-through text-sm">Rp{{ item.product.price * item.quantity }}</span>
              <span v-else class="font-bold">Rp{{ item.product.price * item.quantity }}</span>
            </div>
          </div>
          <div class="text-xl font-bold text-right mt-8">Total: Rp.{{ totalPaymentWithPromo }}</div>
          <div class="mt-4">
            <Button label="Proceed to Payment" class="w-full p-button-primary" :loading="isLoadingPayment" @click="proceedToPayment" />
          </div>
        </div>
        <div v-else class="text-center text-gray-500">Your cart is empty.</div>
      </div>
    </Drawer>

    <!-- QR Code Dialog -->
    <Dialog v-model:visible="showQRCode" header="Scan Here" modal :closable="true" :style="{ width: '350px', height: '400px' }">
      <div class="p-4 text-center">
        <img :src="qrCode" alt="QR Code" class="mx-auto mb-4" />
      </div>
    </Dialog>

    <!-- QR Code Receipt Detail Dialog -->
    <Dialog v-model:visible="isQRCodeDetailDialogVisible" header="Receipt QR Code & Details" modal :style="{ width: '90%', 'max-width': '600px' }">
      <div class="p-4">
        <div v-if="selectedReceipt" class="flex flex-col gap-4">
          <!-- QR Code -->
          <div class="text-center">
            <img :src="qrCodeDataUrl" alt="Receipt QR Code" class="mx-auto mb-4 w-48 h-48 object-contain" v-if="qrCodeDataUrl" />
            <p v-else class="text-gray-500">Generating QR Code...</p>
            <p class="text-sm text-gray-500">Scan this QR Code for receipt verification</p>
          </div>

          <!-- Receipt Details -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-semibold mb-2">Transaction Details</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p><strong>Receipt #:</strong> {{ selectedReceipt.receiptNumber }}</p>
                <p><strong>Date:</strong> {{ new Date(selectedReceipt.timestamp).toLocaleDateString() }}</p>
                <p><strong>Time:</strong> {{ new Date(selectedReceipt.timestamp).toLocaleTimeString() }}</p>
                <p><strong>User ID:</strong> {{ loggedInUser }}</p>
              </div>
              <div>
                <p><strong>Location:</strong> Universitas Brawijaya</p>
                <p><strong>Voucher:</strong> {{ selectedReceipt.usedVoucher ? `Yes (${selectedReceipt.voucherDiscount}%)` : 'No' }}</p>
                <p><strong>Grand Total:</strong> Rp{{ selectedReceipt.grandTotal }}</p>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-semibold mb-2">Items Purchased</h3>
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th class="px-2 py-2">Item</th>
                  <th class="px-2 py-2">Qty</th>
                  <th class="px-2 py-2">Price</th>
                  <th class="px-2 py-2">Total</th>
                  <th class="px-2 py-2">Rak</th>
                  <th class="px-2 py-2">Discount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedReceipt.items" :key="item.id" class="bg-white border-b">
                  <td class="px-2 py-2">{{ item.name }} (ID: {{ item.id }})</td>
                  <td class="px-2 py-2">{{ item.quantity }}</td>
                  <td class="px-2 py-2">Rp{{ item.price }}</td>
                  <td class="px-2 py-2">Rp{{ item.totalPrice }}</td>
                  <td class="px-2 py-2">{{ item.rak }}</td>
                  <td class="px-2 py-2">{{ item.discount }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center text-gray-500">No receipt selected.</div>
      </div>
    </Dialog>

    <!-- Payment Success Modal -->
    <Dialog v-model:visible="showPaymentSuccessModal" header="Payment Successfully" modal :closable="true" :style="{ width: '300px', height: '300px' }">
      <div class="p-4 text-center">
        <i class="pi pi-check-circle mt-5" style="font-size: 4rem; color: #27ae60" />
        <p class="font-bold mt-6">Your payment was successful!</p>
        <p>Please wait while we prepare your product.</p>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import qrcodeImage from "../assets/qrcode.png";
import { db } from "../firebase";
import { onValue, ref as dbRef, update, remove, push, get, set } from "firebase/database";
import { getStorage, ref as storRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import jsPDF from "jspdf";
import { useRouter } from "vue-router";
import QRCode from "qrcode"; 

export default {
  setup() {
    const router = useRouter();
    // Tambahkan state untuk deviceId
    const deviceId = ref("");
    const loadingDeviceId = ref(false);
    
    
    const toast = useToast();
    const confirm = useConfirm();
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
    const isEditDialogVisible = ref(false);
    const files = ref([]);
    const imageUrl = ref(null);
    const loggedInUser = ref(localStorage.getItem("loggedInUser") || "");
    const isAddNewDialogVisible = ref(false);
    const newProduct = ref({
      name: "",
      desc: "",
      price: 0,
      discount: 0,
      rak: 0,
      stock: 0,
      image: "",
    });
    const loading = ref(false);
    const promoDiscount = ref(0);
    const isReceiptsDialogVisible = ref(false);
    const receipts = ref([]);
    const sortOrder = ref("desc");

    const isQRCodeDetailDialogVisible = ref(false);
    const qrCode = qrcodeImage; // Pastikan qrcodeImage sudah diimpor
    const selectedReceipt = ref(null);
    const qrCodeDataUrl = ref(null); 

    const saveDeviceId = async () => {
      if (!loggedInUser.value) {
        toast.add({
          severity: "warn",
          summary: "Not Logged In",
          detail: "Please login first.",
          life: 3000,
        });
        return;
      }
      if (!deviceId.value.trim()) {
        toast.add({
          severity: "error",
          summary: "Invalid Input",
          detail: "Device ID cannot be empty.",
          life: 3000,
        });
        return;
      }

      loadingDeviceId.value = true;
      const userRef = dbRef(db, `users/${loggedInUser.value}`);
      try {
        await update(userRef, { deviceId: deviceId.value });
        toast.add({
          severity: "success",
          summary: "Device ID Updated",
          detail: `Device ID set to ${deviceId.value}`,
          life: 3000,
        });
      } catch (error) {
        console.error("Error saving deviceId:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to save Device ID.",
          life: 3000,
        });
      } finally {
        loadingDeviceId.value = false;
      }
    };

    const generateQRCode = async (receipt) => {
      try {
        const receiptData = JSON.stringify({
          receiptNumber: receipt.receiptNumber,
          timestamp: receipt.timestamp,
          grandTotal: receipt.grandTotal,
          items: receipt.items,
          voucher: receipt.usedVoucher ? receipt.voucherDiscount : null,
          userId: loggedInUser.value,
        });
        qrCodeDataUrl.value = await QRCode.toDataURL(receiptData, {
          width: 200, // Ukuran QR code
          margin: 1,  // Margin QR code
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.add({
          severity: "error",
          summary: "QR Code Error",
          detail: "Failed to generate QR code.",
          life: 3000,
        });
      }
    };

    const showReceiptQRCode = async (receipt) => {
      selectedReceipt.value = receipt;
      qrCodeDataUrl.value = null; // Reset QR code sebelum generate baru
      await generateQRCode(receipt); // Generate QR code
      isQRCodeDetailDialogVisible.value = true;
    };

    const truncateDescription = (desc, maxLength = 50) => {
      if (desc.length <= maxLength) return desc;
      return desc.substring(0, maxLength).trim() + "...";
    };

    const sortedReceipts = computed(() => {
      const sorted = [...receipts.value]; // Salin array agar tidak mutasi asli
      sorted.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder.value === "desc" ? dateB - dateA : dateA - dateB;
      });
      return sorted;
    });

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
    };

    // Fungsi untuk mencatat aktivitas ke Firebase
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
          console.log(`Activity ${activityCode} logged for ${loggedInUser.value}${description ? ` with description: ${description}` : ''}`);
        } catch (error) {
          console.error("Error logging activity:", error);
        }
      }
    };

    const updateStatusToAdmin = async () => {
      if (loggedInUser.value) {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        const statusChangeRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
        try {
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            await update(userRef, { status: "S003" });
            await push(statusChangeRef, { status: "S003", timestamp: new Date().toISOString() });
          }
          logActivity("S003");
        } catch (error) {
          console.error("Error updating status to S003:", error);
          toast.add({ severity: "error", summary: "Error", detail: "Failed to update status to Online-Setup.", life: 3000 });
        }
      }
    };

    const goToRun = async () => {
      if (loggedInUser.value) {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        const statusChangeRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
        try {
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            await update(userRef, { status: "S001" });
            await push(statusChangeRef, { status: "S001", timestamp: new Date().toISOString() });
          }
          router.push("/");
        } catch (error) {
          console.error("Error updating status to S001:", error);
          toast.add({ severity: "error", summary: "Error", detail: "Failed to update status.", life: 3000 });
        }
      } else {
        toast.add({ severity: "warn", summary: "Not Logged In", detail: "Please login first.", life: 3000 });
      }
    };

    const goToLogin = () => {
      router.push("/login");
    };

    const responsiveOptions = ref([
      { breakpoint: "1400px", numVisible: 2, numScroll: 1 },
      { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
      { breakpoint: "767px", numVisible: 2, numScroll: 1 },
      { breakpoint: "575px", numVisible: 1, numScroll: 1 },
    ]);

    const downloadReceiptAsPDF = async (receipt) => {
      try {
        console.log("Starting PDF generation for receipt:", receipt);

        const doc = new jsPDF();
        console.log("jsPDF instance created");

        // Slide 1: Detail Transaksi
        doc.setFontSize(16);
        doc.text("Studio 8 Workshop", 10, 10);
        doc.setFontSize(12);
        doc.text("Jl. Tombro Tengah No.4", 10, 20);
        doc.text("Kota Malang", 10, 30);
        doc.setFontSize(16);
        doc.text("R E C E I P T", 160, 40);

        doc.setFontSize(12);
        doc.text("Location: Universitas Brawijaya", 10, 50);
        doc.text(`Receipt# : ${receipt.receiptNumber}`, 120, 50);
        doc.text(`R. Date  : ${new Date(receipt.timestamp).toLocaleDateString()}`, 120, 60);
        doc.text(`R. Time  : ${new Date(receipt.timestamp).toLocaleTimeString()}`, 120, 70);
        doc.text(`IDVM     : ${loggedInUser.value}`, 120, 80);

        doc.text("----------------------------------------------------------------------------------------------------------------------------------------", 10, 96);
        doc.text("QTY", 10, 100);
        doc.text("Description", 25, 100);
        doc.text("Unit Price", 120, 100);
        doc.text("Amount", 170, 100);
        doc.text("----------------------------------------------------------------------------------------------------------------------------------------", 10, 104);

        let yPosition = 114;
        receipt.items.forEach((item) => {
          const qty = `${item.quantity}`;
          const rak = item.rak !== undefined ? item.rak : "N/A"; // Fallback ke "N/A" jika rak undefined
          const description = `[${rak}] ${item.name}`;
          const unitPrice = `Rp${item.price || 0}`;
          const totalPrice = item.totalPrice !== undefined ? item.totalPrice : (item.price || 0) * item.quantity;
          const amount = `Rp${totalPrice}`;

          doc.text(qty, 10, yPosition);
          doc.text(description, 25, yPosition, { maxWidth: 90 });
          doc.text(unitPrice, 120, yPosition);
          doc.text(amount, 170, yPosition);

          yPosition += 10;
        });

        doc.text("----------------------------------------------------------------------------------------------------------------------------------------", 10, yPosition);
        yPosition += 10;
        const subtotal = receipt.grandTotal + (receipt.voucherDiscount || 0);
        doc.text(`Subtotal:                Rp${subtotal}`, 135, yPosition);
        yPosition += 10;
        doc.text(`Diskon:                  Rp${receipt.voucherDiscount || 0}`, 135, yPosition);
        yPosition += 10;
        doc.text("----------------------------------------------", 135, yPosition);
        yPosition += 10;
        doc.text(`Total (IDR):             Rp${receipt.grandTotal}`, 135, yPosition);
        yPosition += 10;
        doc.text("----------------------------------------------------------------------------------------------------------------------------------------", 10, yPosition);
        yPosition += 10;

        const machineStatus = products.value.some(p => p.stock === 0) ? "NOT OK" : "OK";
        doc.text(`Status Machine = ${machineStatus}`, 10, yPosition);

        // Slide 2: Bukti Pembayaran (opsional)
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Bukti Pembayaran", 10, 10);
        // doc.addImage(receipt.paymentProof, 'PNG', 10, 20, 180, 180); // Uncomment jika ada bukti pembayaran

        const fileName = `receipt_${receipt.receiptNumber}_${new Date(receipt.timestamp).toISOString().split("T")[0]}.pdf`;
        doc.save(fileName);
        console.log("PDF saved with filename:", fileName);

        toast.add({
          severity: "success",
          summary: "PDF Downloaded",
          detail: `Receipt ${receipt.receiptNumber} has been downloaded successfully.`,
          life: 3000
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.add({
          severity: "error",
          summary: "Download Failed",
          detail: `Failed to download receipt: ${error.message}`,
          life: 5000
        });
      }
    };

    const validPromoCodes = { "DISKON10": 10, "DISKON20": 20, "FREESHIP": 15 };

    const getDiscountedPrice = (product) => {
      return product.discount && product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;
    };

    const totalPaymentWithPromo = computed(() => {
      const subtotal = cartItems.value.reduce((total, item) => total + getDiscountedPrice(item.product) * item.quantity, 0);
      return Math.round(subtotal * (1 - promoDiscount.value / 100));
    });

    const determineInventoryStatus = (stock) => {
      if (stock > 5) return "INSTOCK";
      if (stock > 0 && stock <= 5) return "LOWSTOCK";
      return "OUTOFSTOCK";
    };

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
    };

    const editProduct = (product) => {
      selectedProduct.value = { ...product };
      files.value = []; 
      imageUrl.value = null; 
      isEditDialogVisible.value = true;
    };

    const onFileChange = (event) => {
      files.value = event.files;
      if (files.value.length > 0) {
        const file = files.value[0]; 
        imageUrl.value = URL.createObjectURL(file); 
      } else {
        imageUrl.value = null; 
      }
    };

    const saveProduct = async () => {
    loading.value = true;
    if (selectedProduct.value && selectedProduct.value.id) {
      const productId = selectedProduct.value.id;
      const productRef = dbRef(db, `users/${loggedInUser.value}/products/${productId}`);

      if (files.value.length > 0) {
        const file = files.value[0];
        const storage = getStorage();
        const storageRef = storRef(storage, `users/${loggedInUser.value}/products/${file.name}`);
        try {
          await uploadBytes(storageRef, file);            
          imageUrl.value = await getDownloadURL(storageRef);
          console.log("File uploaded, URL:", imageUrl.value);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.add({ 
            severity: "error", 
            summary: "Upload Error", 
            detail: "Failed to upload image.", 
            group: "tr" 
          });
          loading.value = false;
          return;
        }
      }

      const imageToUpdate = imageUrl.value || selectedProduct.value.image;
      const updatedStock = selectedProduct.value.stock;
      const updatedInventoryStatus = determineInventoryStatus(updatedStock);

      // Tentukan kode aktivitas berdasarkan nomor rak
      const rakNumber = String(selectedProduct.value.rak).padStart(3, "0");
      const activityCode = `I${rakNumber}`;

      // Tentukan perubahan apa yang terjadi untuk log
      const originalProduct = products.value.find(p => p.id === productId);
      let changes = [];
      if (originalProduct.name !== selectedProduct.value.name) changes.push("Name");
      if (originalProduct.desc !== selectedProduct.value.desc) changes.push("Description");
      if (originalProduct.price !== selectedProduct.value.price) changes.push("Price");
      if (originalProduct.discount !== selectedProduct.value.discount) changes.push("Discount");
      if (originalProduct.rak !== selectedProduct.value.rak) changes.push("Rak");
      if (originalProduct.stock !== selectedProduct.value.stock) changes.push("Stock");
      if (imageUrl.value) changes.push("Image");

      try {
        await update(productRef, {
          name: selectedProduct.value.name,
          desc: selectedProduct.value.desc,
          price: selectedProduct.value.price,
          discount: selectedProduct.value.discount || 0,
          stock: updatedStock,
          image: imageToUpdate,
          rak: selectedProduct.value.rak,
          inventoryStatus: updatedInventoryStatus,
        });

        // Log aktivitas
        const description = `IN:Updated Item - ${selectedProduct.value.name} (${changes.join(", ")})`;
        await logActivity(activityCode, description);

        toast.add({
          severity: "success",
          summary: "Product updated",
          detail: `${selectedProduct.value.name} has been updated. Stock status: ${updatedInventoryStatus}`,
          group: "tr",
        });
        isEditDialogVisible.value = false;
      } catch (error) {
        console.error("Error updating product:", error);
        toast.add({ 
          severity: "error", 
          summary: "Error", 
          detail: `Failed to update ${selectedProduct.value.name}. ${error.message}`, 
          group: "tr", 
          life: 3000 
        });
      }
    }
    loading.value = false;
  };

    const cancelEdit = () => {
      isEditDialogVisible.value = false;
      loading.value = false;
    };

    const openAddNewProductDialog = () => {
      isAddNewDialogVisible.value = true;
    };

    const closeAddNewProductDialog = () => {
      isAddNewDialogVisible.value = false;
      loading.value = false;
      newProduct.value = { name: "", desc: "", price: 0, discount: 0, rak: 0, stock: 0, image: "" };
    };

    const saveNewProduct = async () => {
      loading.value = true;
      const { name, desc, price, discount, rak, stock } = newProduct.value;

      if (!name || !desc || price <= 0 || stock < 0 || !rak) {
        toast.add({ severity: "error", summary: "Invalid Input", detail: "Please fill in all fields correctly.", group: "tr", life: 3000 });
        loading.value = false;
        return;
      }

      let imageUrl = "";
      if (files.value.length > 0) {
        const file = files.value[0];
        const storage = getStorage();
        const storageRef = storRef(storage, `users/${loggedInUser.value}/products/${file.name}`);
        try {
          const snapshot = await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          toast.add({ severity: "error", summary: "Upload Error", detail: "Failed to upload product image.", group: "tr", life: 3000 });
          loading.value = false;
          console.log("Error uploading image:", error);
          return;
        }
      }

      try {
        const productsRef = dbRef(db, `users/${loggedInUser.value}/products`);
        const snapshot = await get(productsRef);
        let lastId = 0;
        if (snapshot.exists()) {
          const productsData = snapshot.val();
          const productIds = Object.keys(productsData);
          if (productIds.length > 0) {
            lastId = Math.max(...productIds.map((id) => parseInt(id, 10)));
          }
        }

        const newProductId = lastId + 1;
        const newInventoryStatus = determineInventoryStatus(stock);

        const newProductData = {
          name,
          id: newProductId,
          desc,
          price,
          discount: discount || 0,
          stock,
          rak,
          image: imageUrl,
          inventoryStatus: newInventoryStatus,
        };

        const newProductRef = dbRef(db, `users/${loggedInUser.value}/products/${newProductId}`);
        await set(newProductRef, newProductData);

        toast.add({ severity: "success", summary: "Product Added", detail: `${name} added successfully.`, life: 3000 });
        closeAddNewProductDialog();
      } catch (error) {
        console.error("Error saving product:", error);
        toast.add({ severity: "error", summary: "Error", detail: "Failed to add product: " + error.message, life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    const deleteProduct = (product) => {
      const productRef = dbRef(db, `users/${loggedInUser.value}/products/${product.id}`);
      confirm.require({
        message: `Do you want to delete ${product.name}?`,
        header: "Danger Zone",
        icon: "pi pi-info-circle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete", severity: "danger" },
        accept: async () => {
          try {
            await remove(productRef);

            // Log aktivitas IXXX untuk barang yang dihapus berdasarkan nomor rak
            const rakNumber = String(product.rak).padStart(3, "0");
            const activityCode = `I${rakNumber}`; // Misal rak 15 jadi "I015"
            const description = `IN:Deleted Item - ${product.name}`;
            await logActivity(activityCode, description);

            toast.add({ life: 3000, severity: "success", summary: "Product deleted", detail: `${product.name} has been removed.`, group: "tr" });
          } catch (error) {
            toast.add({ life: 3000,  severity: "error", summary: "Error", detail: `Failed to delete ${product.name}. ${error.message}`, group: "tr", life: 3000 });
          }
        },
        reject: () => {
          toast.add({ life: 3000,  severity: "error", summary: "Canceled", detail: "You have rejected to delete", life: 3000, group: "tr" });
        },
      });
    };

    const addToCart = (product) => {
      const existingItem = cartItems.value.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.value.push({ product, quantity: 1 });
      }
      cartCount.value += 1;
      calculateTotalPayment();
    };

    const calculateTotalPayment = () => {
      totalPayment.value = cartItems.value.reduce((total, item) => total + getDiscountedPrice(item.product) * item.quantity, 0);
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
      animatingElem.style.width = "50px";
      animatingElem.style.height = "50px";
      animatingElem.style.borderRadius = "50%";
      animatingElem.style.backgroundSize = "cover";
      animatingElem.style.left = `${clientX}px`;
      animatingElem.style.top = `${clientY}px`;
      animatingElem.style.transition = "all 0.7s ease-in-out";
      animatingElem.style.zIndex = "1100";

      document.body.appendChild(animatingElem);

      setTimeout(() => {
        animatingElem.style.left = `${cartRect.left + cartRect.width / 2}px`;
        animatingElem.style.top = `${cartRect.top + cartRect.height / 2}px`;
        animatingElem.style.transform = "scale(0.5)";
        animatingElem.style.opacity = "0";
        setTimeout(() => document.body.removeChild(animatingElem), 700);
      }, 10);
    };

    const decreaseQuantity = (item) => {
      if (item.quantity >= 1) {
        item.quantity -= 1;
        cartCount.value -= 1;
        calculateTotalPayment();
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
    };

    const proceedToPayment = () => {
      isLoadingPayment.value = true;
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
      }, 6000);
    };

    const toggleCartDrawer = () => {
      isCartDrawerVisible.value = !isCartDrawerVisible.value;
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
      return results;
    });

    const openDrawer = (product) => {
      selectedProduct.value = product;
      isDrawerVisible.value = true;
    };

    const closeDrawer = () => {
      isDrawerVisible.value = false;
    };

    const openReceiptsDialog = () => {
      isReceiptsDialogVisible.value = true;
    };

    const deleteReceipt = (receipt) => {
      confirm.require({
        message: `Are you sure you want to delete this receipt from ${new Date(receipt.timestamp).toLocaleString()}?`,
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete", severity: "danger" },
        accept: async () => {
          const receiptRef = dbRef(db, `users/${loggedInUser.value}/receipts/${receipt.id}`);
          try {
            await remove(receiptRef);
            toast.add({ severity: "success", summary: "Receipt Deleted", detail: "Receipt has been successfully deleted.", life: 3000 });
          } catch (error) {
            console.error("Error deleting receipt:", error);
            toast.add({ severity: "error", summary: "Delete Failed", detail: "Failed to delete receipt.", life: 3000 });
          }
        },
        reject: () => {
          toast.add({ severity: "info", summary: "Canceled", detail: "Receipt deletion canceled.", life: 3000 });
        },
      });
    };

    const deleteAllReceipts = () => {
      confirm.require({
        message: "Are you sure you want to delete all receipts? This action cannot be undone.",
        header: "Confirm Delete All",
        icon: "pi pi-exclamation-triangle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete All", severity: "danger" },
        accept: async () => {
          const receiptsRef = dbRef(db, `users/${loggedInUser.value}/receipts`);
          try {
            await remove(receiptsRef);
            toast.add({ severity: "success", summary: "All Receipts Deleted", detail: "All receipts have been successfully deleted.", life: 3000 });
          } catch (error) {
            console.error("Error deleting all receipts:", error);
            toast.add({ severity: "error", summary: "Delete Failed", detail: "Failed to delete all receipts.", life: 3000 });
          }
        },
        reject: () => {
          toast.add({ severity: "info", summary: "Canceled", detail: "Delete all receipts canceled.", life: 3000 });
        },
      });
    };

    onMounted(() => {
      console.log("Admin.vue: loggedInUser =", loggedInUser.value);
      if (!loggedInUser.value) {
        console.error("No logged-in user found!");
        router.push('/login');
        return;
      } else {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        onValue(
          userRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data && data.deviceId) {
              deviceId.value = data.deviceId;
            } else {
              deviceId.value = ""; // Default kosong jika belum ada
            }
          },
          { onlyOnce: true }
        );
      }
      updateStatusToAdmin();
      
      const promosRef = dbRef(db, `users/${loggedInUser.value}/promos`);
      onValue(promosRef, (snapshot) => {
        const fetchedPromos = snapshot.val();
        promos.value = fetchedPromos ? Object.values(fetchedPromos).filter((item) => item && item.image && item.name) : [];
      });

      const productsRef = dbRef(db, `users/${loggedInUser.value}/products`);
      onValue(productsRef, (snapshot) => {
        const fetchedProducts = snapshot.val();
        products.value = fetchedProducts 
          ? Object.values(fetchedProducts).filter((item) => item && item.image && item.name) 
          : [];
        console.log(`Admin.vue: Products loaded for ${loggedInUser.value}:`, products.value);
        window.scrollTo(0, 0); // Kembali ke atas saat data diperbarui
      }, (error) => {
        console.error("Error fetching products in Admin.vue:", error);
      });

      const receiptsRef = dbRef(db, `users/${loggedInUser.value}/receipts`);
      onValue(receiptsRef, (snapshot) => {
        const fetchedReceipts = snapshot.val();
        receipts.value = fetchedReceipts 
          ? Object.entries(fetchedReceipts).map(([id, data]) => ({ id, ...data }))
          : [];
        console.log(`Receipts loaded for ${loggedInUser.value}:`, receipts.value);
      });

      if (localStorage.getItem('isFullyAuthenticated') !== 'true') {
        router.push('/login');
        toast.add({ severity: 'warn', summary: 'Access Denied', detail: 'Please login to access Admin', life: 3000 });
      } else {
        updateStatusToAdmin();
      }



    });

    return {
      deviceId,
      loadingDeviceId,
      saveDeviceId,
      showReceiptQRCode,
      qrCodeDataUrl,
      isQRCodeDetailDialogVisible, 
      selectedReceipt, 
      truncateDescription, 
      loggedInUser,
      goToLogin,
      goToRun,
      downloadReceiptAsPDF,
      promos,
      responsiveOptions,
      getSeverity,
      products,
      filter,
      filteredProducts,
      filterProducts,
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
      totalPaymentWithPromo,
      decreaseQuantity,
      increaseQuantity,
      proceedToPayment,
      showPaymentSuccessModal,
      isLoadingPayment,
      showQRCode,
      qrCode,
      animateProductToCart,
      closeDrawer,
      editProduct,
      deleteProduct,
      isEditDialogVisible,
      saveProduct,
      cancelEdit,
      onFileChange,
      isAddNewDialogVisible,
      newProduct,
      openAddNewProductDialog,
      closeAddNewProductDialog,
      saveNewProduct,
      loading,
      getDiscountedPrice,
      isReceiptsDialogVisible,
      receipts,
      openReceiptsDialog,
      deleteReceipt,
      deleteAllReceipts,
      sortOrder,
      sortedReceipts,
      toggleSortOrder,
    };
  },
};
</script>

<style>
.animating-product {
  z-index: 1100;
  pointer-events: none;
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
</style>