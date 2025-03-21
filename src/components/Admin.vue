<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="w-full">
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
        <!-- Filter Buttons -->
        <div class="flex gap-2 mb-6">
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
        </div>

        <!-- Add New Product Button and View Receipts Button -->
        <div class="flex gap-2 mb-6">
          <button @click="openReceiptsDialog" class="p-button">
            <i class="pi pi-file"></i>
            View Receipts
          </button>
          <button @click="openAddNewProductDialog" class="p-button">
            <i class="pi pi-plus"></i>
            New Item
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
            <img
              :src="product.image"
              alt="product.name"
              class="w-38 h-38 object-cover rounded-md mb-2"
            />
          </div>
          <Tag
            :value="product.inventoryStatus"
            :severity="getSeverity(product.inventoryStatus)"
            class="rounded-xl -ml-3 mt-3"
            style="border-radius: 0 10px 10px 0"
          />
          <h3 class="text-lg font-medium mt-2">{{ product.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ product.desc }}</p>
          <p class="text-sm text-gray-500 mt-1">
            No.{{ product.rak }} | Stok : {{ product.stock }}
          </p>
          <div class="flex justify-between items-center mt-2">
            <div>
              <p v-if="product.discount > 0" class="text-red-600 font-bold">Rp{{ getDiscountedPrice(product) }}</p>
              <p v-if="product.discount > 0" class="text-gray-500 line-through">Rp{{ product.price }}</p>
              <p v-else class="text-gray-600 font-bold">Rp{{ product.price }}</p>
            </div>
            <div class="justify-end">
              <button class="text-primary px-2 py-1 rounded-xl" @click.stop="editProduct(product)">
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
    <Dialog
      v-model:visible="isEditDialogVisible"
      header="Edit Product"
      modal
      class="w-[80%] lg:w-[25%]"
    >
      <div class="p-4">
        <!-- File Upload Input -->
        <div class="mb-3">
          <label for="productImage" class="block text-sm font-medium mb-1"
            >Product Image</label
          >
          <FileUpload
            id="productImage"
            @select="onFileChange"
            accept="image/*"
            class="w-full"
            mode="basic"
          />
        </div>
        <div class="mb-3">
          <label for="productName" class="block text-sm font-medium mb-1"
            >Product Name</label
          >
          <InputText
            id="productName"
            v-model="selectedProduct.name"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productDesc" class="block text-sm font-medium mb-1"
            >Description</label
          >
          <InputText
            id="productDesc"
            v-model="selectedProduct.desc"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productPrice" class="block text-sm font-medium mb-1"
            >Price</label
          >
          <InputNumber
            id="productPrice"
            v-model="selectedProduct.price"
            mode="currency"
            currency="IDR"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productRak" class="block text-sm font-medium mb-1"
            >Rak</label
          >
          <InputNumber
            id="productRak"
            v-model="selectedProduct.rak"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productStock" class="block text-sm font-medium mb-1"
            >Stock</label
          >
          <InputNumber
            id="productStock"
            v-model="selectedProduct.stock"
            class="w-full"
          />
        </div>

        <div class="flex justify-end mt-8 gap-2">
          <Button
            label="Cancel"
            class="p-button-secondary"
            @click="cancelEdit"
          />
          <Button
            label="Save"
            class="p-button-primary"
            @click="saveProduct"
            :loading="loading"
          />
        </div>
      </div>
    </Dialog>

    <!-- Add New Product Dialog -->
    <Dialog
      v-model:visible="isAddNewDialogVisible"
      header="Add New Product"
      modal
      class="w-[80%] lg:w-[25%]"
    >
      <div class="p-4">
        <div class="mb-3">
          <label for="productImage" class="block text-sm font-medium mb-1">Product Image</label>
          <FileUpload
            id="productImage"
            @select="onFileChange"
            accept="image/*"
            class="w-full"
            mode="basic"
          />
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
          <InputNumber
            id="productPrice"
            v-model="newProduct.price"
            mode="currency"
            currency="IDR"
            class="w-full"
          />
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
    <Dialog
      v-model:visible="isReceiptsDialogVisible"
      header="Transaction Receipts"
      modal
      class="w-[90%] lg:w-[50%]"
    >
      <div class="p-4">
        <div class="flex justify-end mb-4">
          <Button
            label="Delete All Receipts"
            class="p-button-danger"
            @click="deleteAllReceipts"
            :disabled="receipts.length === 0"
          />
        </div>
        <div v-if="receipts.length > 0" class="overflow-x-auto">
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
              <tr v-for="receipt in receipts" :key="receipt.id" class="bg-white border-b">
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
        <div v-if="selectedProduct" class="text-2xl font-bold">
          {{ selectedProduct.name }}
        </div>
      </template>
      <div v-if="selectedProduct" class="p-4">
        <img
          :src="selectedProduct.image"
          alt="selectedProduct.name"
          class="w-full h-full object-cover rounded-md mb-4"
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedProduct.desc }}</p>
        <p class="text-sm text-gray-500 mt-2">
          Rak: {{ selectedProduct.rak }} | Stok: {{ selectedProduct.stock }}
        </p>
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
          <div v-for="(item, index) in cartItems" :key="index" class="flex items-center justify-between mb-4">
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

export default {
  setup() {
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
    const qrCode = qrcodeImage;
    const isEditDialogVisible = ref(false);
    const files = ref([]);
    const imageUrl = ref(null);
    const responsiveOptions = ref([
      { breakpoint: "1400px", numVisible: 2, numScroll: 1 },
      { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
      { breakpoint: "767px", numVisible: 2, numScroll: 1 },
      { breakpoint: "575px", numVisible: 1, numScroll: 1 },
    ]);
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

    const downloadReceiptAsPDF = (receipt) => {
      const doc = new jsPDF();
      
      // Judul
      doc.setFontSize(16);
      doc.text("Transaction Receipt", 10, 10);
      
      // Informasi Waktu
      doc.setFontSize(12);
      doc.text(`Time: ${new Date(receipt.timestamp).toLocaleString()}`, 10, 20);
      
      // Header Tabel
      doc.text("Items:", 10, 30);
      doc.setFontSize(10);
      let yPosition = 40;

      // Daftar Item
      receipt.items.forEach((item) => {
        const itemText = `${item.name} (ID: ${item.id}) - Qty: ${item.quantity}, Price: Rp${item.price}, Total: Rp${item.totalPrice}, Rak: ${item.rak}, Disc: ${item.discount}%`;
        doc.text(itemText, 10, yPosition);
        yPosition += 10; // Tambah jarak antar baris
      });

      // Grand Total dan Voucher
      doc.text(`Grand Total: Rp${receipt.grandTotal}`, 10, yPosition + 10);
      doc.text(`Voucher: ${receipt.usedVoucher ? `Yes (${receipt.voucherDiscount}%)` : "No"}`, 10, yPosition + 20);

      // Simpan file PDF
      doc.save(`receipt_${receipt.id}_${new Date(receipt.timestamp).toISOString().split("T")[0]}.pdf`);
    };

    const validPromoCodes = {
      "DISKON10": 10,
      "DISKON20": 20,
      "FREESHIP": 15
    };

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
      isEditDialogVisible.value = true;
    };

    const onFileChange = (event) => {
      files.value = event.files;
    };

    const saveProduct = async () => {
      loading.value = true;
      if (selectedProduct.value && selectedProduct.value.id) {
        const productId = selectedProduct.value.id;
        const productRef = dbRef(db, `products/${productId}`);

        if (files.value.length > 0) {
          const file = files.value[0];
          const storage = getStorage();
          const storageRef = storRef(storage, `products/${file.name}`);

          try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            imageUrl.value = downloadURL;
          } catch (error) {
            console.error("Error uploading file:", error);
            toast.add({
              severity: "error",
              summary: "Upload Error",
              detail: "Failed to upload image.",
              group: "tr",
            });
            loading.value = false;
            return;
          }
        }

        const imageToUpdate = imageUrl.value || selectedProduct.value.image;
        const updatedStock = selectedProduct.value.stock;
        const updatedInventoryStatus = determineInventoryStatus(updatedStock);

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
            life: 3000,
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
        toast.add({
          severity: "error",
          summary: "Invalid Input",
          detail: "Please fill in all fields correctly.",
          group: "tr",
          life: 3000,
        });
        loading.value = false;
        return;
      }

      let imageUrl = "";
      if (files.value.length > 0) {
        const file = files.value[0];
        const storage = getStorage();
        const storageRef = storRef(storage, `products/${file.name}`);

        try {
          const snapshot = await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          toast.add({
            severity: "error",
            summary: "Upload Error",
            detail: "Failed to upload product image.",
            group: "tr",
            life: 3000,
          });
          loading.value = false;
          console.log("Error uploading image:", error);
          return;
        }
      }

      const productsRef = dbRef(db, "products");
      try {
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

        const newProductRef = dbRef(db, `products/${newProductId}`);
        await set(newProductRef, newProductData);

        toast.add({
          severity: "success",
          summary: "Product Added",
          detail: `The new product ${name} has been added with status: ${newInventoryStatus}`,
          group: "tr",
        });
        closeAddNewProductDialog();
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to add new product.",
          group: "tr",
          life: 3000,
        });
        console.log("Error saving product:", error);
      }
      loading.value = false;
    };

    const deleteProduct = (product) => {
      const productRef = dbRef(db, `products/${product.id}`);
      confirm.require({
        message: `Do you want to delete ${product.name}?`,
        header: "Danger Zone",
        icon: "pi pi-info-circle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete", severity: "danger" },
        accept: () => {
          remove(productRef)
            .then(() => {
              toast.add({
                severity: "success",
                summary: "Product deleted",
                detail: `${product.name} has been removed.`,
                group: "tr",
              });
            })
            .catch((error) => {
              toast.add({
                severity: "error",
                summary: "Error",
                detail: `Failed to delete ${product.name}. ${error.message}`,
                group: "tr",
                life: 3000,
              });
            });
        },
        reject: () => {
          toast.add({
            severity: "error",
            summary: "Canceled",
            detail: "You have rejected to delete",
            life: 3000,
            group: "tr",
          });
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
      let total = 0;
      cartItems.value.forEach((item) => {
        const price = getDiscountedPrice(item.product);
        total += price * item.quantity;
      });
      totalPayment.value = total;
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
          cartItems.value = cartItems.value.filter(
            (cartItem) => cartItem.product.id !== item.product.id
          );
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

    // Fungsi untuk menghapus satu receipt
    const deleteReceipt = (receipt) => {
      confirm.require({
        message: `Are you sure you want to delete this receipt from ${new Date(receipt.timestamp).toLocaleString()}?`,
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete", severity: "danger" },
        accept: async () => {
          const receiptRef = dbRef(db, `receipts/${receipt.id}`);
          try {
            await remove(receiptRef);
            toast.add({
              severity: "success",
              summary: "Receipt Deleted",
              detail: "Receipt has been successfully deleted.",
              life: 3000
            });
          } catch (error) {
            console.error("Error deleting receipt:", error);
            toast.add({
              severity: "error",
              summary: "Delete Failed",
              detail: "Failed to delete receipt.",
              life: 3000
            });
          }
        },
        reject: () => {
          toast.add({
            severity: "info",
            summary: "Canceled",
            detail: "Receipt deletion canceled.",
            life: 3000
          });
        }
      });
    };

    // Fungsi untuk menghapus semua receipt
    const deleteAllReceipts = () => {
      confirm.require({
        message: "Are you sure you want to delete all receipts? This action cannot be undone.",
        header: "Confirm Delete All",
        icon: "pi pi-exclamation-triangle",
        rejectLabel: "Cancel",
        rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
        acceptProps: { label: "Delete All", severity: "danger" },
        accept: async () => {
          const receiptsRef = dbRef(db, "receipts");
          try {
            await remove(receiptsRef);
            toast.add({
              severity: "success",
              summary: "All Receipts Deleted",
              detail: "All receipts have been successfully deleted.",
              life: 3000
            });
          } catch (error) {
            console.error("Error deleting all receipts:", error);
            toast.add({
              severity: "error",
              summary: "Delete Failed",
              detail: "Failed to delete all receipts.",
              life: 3000
            });
          }
        },
        reject: () => {
          toast.add({
            severity: "info",
            summary: "Canceled",
            detail: "Delete all receipts canceled.",
            life: 3000
          });
        }
      });
    };

    onMounted(() => {
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

      const receiptsRef = dbRef(db, "receipts");
      onValue(receiptsRef, (snapshot) => {
        const fetchedReceipts = snapshot.val();
        receipts.value = fetchedReceipts
          ? Object.entries(fetchedReceipts).map(([id, data]) => ({ id, ...data }))
          : [];
      });
    });

    return {
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
      deleteReceipt, // Tambah fungsi hapus receipt
      deleteAllReceipts // Tambah fungsi hapus semua receipt
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