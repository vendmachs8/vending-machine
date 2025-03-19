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

    <!-- Categories (Items) -->
    <!-- <section class="container mx-auto px-4 py-6">
        <h2 class="text-xl font-semibold mb-4">Items</h2>
        <div class="flex overflow-x-auto gap-4 scrollbar-hidden">
          <div
            v-for="product in products"
            :key="product.id"
            class="border border-surface-200 dark:border-surface-700 bg-white rounded-2xl p-4 hover:shadow-lg transition flex-shrink-0"
          >
            <img
              :src="product.image"
              alt="product.name"
              class="w-full h-14 object-cover rounded-md mb-2"
            />
            <h3 class="text-lg font-medium">{{ product.name }}</h3>
            <p class="text-gray-600">{{ product.price }}</p>
            <button
              class="mt-2 w-full text-white px-4 py-2 rounded-md transition"
              style="background-color: var(--p-primary-500)"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </section> -->

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

        <!-- Add New Product Button -->
        <button @click="openAddNewProductDialog" class="mb-6 p-button">
          <i class="pi pi-plus"></i>
          New Item
        </button>
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
            <p class="text-gray-600 font-bold">Rp.{{ product.price }}</p>

            <div class="justify-end">
              <!-- Edit Button -->
              <button
                class="text-primary px-2 py-1 rounded-xl"
                @click.stop="editProduct(product)"
              >
                <i class="pi pi-pencil"></i>
              </button>

              <!-- Delete Button -->
              <button
                class="text-red-500 px-2 py-1 rounded-xl"
                @click.stop="deleteProduct(product)"
              >
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
            v-model="newProduct.name"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productDesc" class="block text-sm font-medium mb-1"
            >Description</label
          >
          <InputText
            id="productDesc"
            v-model="newProduct.desc"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productPrice" class="block text-sm font-medium mb-1"
            >Price</label
          >
          <InputNumber
            id="productPrice"
            v-model="newProduct.price"
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
            v-model="newProduct.rak"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <label for="productStock" class="block text-sm font-medium mb-1"
            >Stock</label
          >
          <InputNumber
            id="productStock"
            v-model="newProduct.stock"
            class="w-full"
          />
        </div>

        <div class="flex justify-end mt-8 gap-2">
          <Button
            label="Cancel"
            class="p-button-secondary"
            @click="closeAddNewProductDialog"
          />
          <Button
            label="Save"
            class="p-button-primary"
            @click="saveNewProduct"
            :loading="loading"
          />
        </div>
      </div>
    </Dialog>

    <!-- Drawer -->
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
          class="w-full h-full object-cover rounded-md mb-4"
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedProduct.desc }}</p>
        <p class="text-sm text-gray-500 mt-2">
          Rak: {{ selectedProduct.rak }} | Stok: {{ selectedProduct.stock }}
        </p>
        <p class="text-gray-600 font-bold mt-4 text-2xl flex justify-center">
          Rp.{{ selectedProduct.price }}
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
                class="p-2 bg-gray-200 rounded-md"
                @click="decreaseQuantity(item)"
              >
                <i class="pi pi-minus" />
              </button>
              <button
                class="p-2 bg-gray-200 rounded-md"
                @click="increaseQuantity(item)"
              >
                <i class="pi pi-plus" />
              </button>
            </div>

            <span class="font-bold"
              >Rp.{{ item.product.price * item.quantity }}</span
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
import { ref, onMounted, computed } from "vue";
import qrcodeImage from "../assets/qrcode.png";
import { db } from "../firebase";
import {
  onValue,
  ref as dbRef,
  update,
  remove,
  push,
  get,
  set,
} from "firebase/database";
import {
  getStorage,
  ref as storRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

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
    const isEditDialogVisible = ref(false); // To control dialog visibility
    const files = ref([]); // Array to store selected files
    const imageUrl = ref(null);
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
    const isAddNewDialogVisible = ref(false);
    const newProduct = ref({
      name: "",
      desc: "",
      price: 0,
      rak: 0,
      stock: 0,
      image: "",
    });
    const loading = ref(false);

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
    };

    // Function to open the edit dialog
    const editProduct = (product) => {
      selectedProduct.value = { ...product }; // Copy product to selectedProduct
      isEditDialogVisible.value = true; // Show dialog
    };

    const onFileChange = (event) => {
      if (selectedProduct.image) {
        // If there's an existing image, use it as the file
        files.value = [
          {
            name: selectedProduct.image.split("/").pop(), // Extract file name from the image URL
            type: "image/jpeg", // Assuming the image is JPEG; adjust based on your needs
            url: selectedProduct.image, // The existing image URL
          },
        ];
      } else {
        // If there's no existing image, just use the selected files
        files.value = event.files;
      }

      // Optionally, you can handle previews here as well if needed:
      // previews.value = files.value.map((file) => {
      //   const reader = new FileReader();
      //   reader.readAsDataURL(file);
      //   return new Promise((resolve) => {
      //     reader.onload = (e) => resolve(e.target.result);
      //   });
      // });
      // Promise.all(previews.value).then((resolvedPreviews) => {
      //   previews.value = resolvedPreviews;
      // });
    };

    // Function to save the edited product
    const saveProduct = async () => {
      loading.value = true;
      // Make sure the selectedProduct has an id (or create it if it's a new product)
      if (selectedProduct.value && selectedProduct.value.id) {
        const productId = selectedProduct.value.id;
        console.log(productId);

        // Reference to the product in the Firebase Realtime Database
        const productRef = dbRef(db, `products/${productId}`);

        if (files.value.length > 0) {
          const file = files.value[0];
          const storage = getStorage();
          const storageRef = storRef(storage, `products/${file.name}`); // Ganti path sesuai dengan struktur yang diinginkan

          try {
            // Upload file ke Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);
            console.log("File uploaded successfully!");

            // Setelah berhasil upload, dapatkan URL file
            const downloadURL = await getDownloadURL(snapshot.ref);
            // Simpan URL gambar ke selectedProduct
            imageUrl.value = downloadURL;
          } catch (error) {
            console.error("Error uploading file:", error);
            toast.add({
              severity: "error",
              summary: "Upload Error",
              detail: "Failed to upload image.",
              group: "tr",
            });
            return; // If there's an error, stop further execution
          }
        }

        const imageToUpdate = imageUrl.value || selectedProduct.value.image;
        console.log("Image URL:", imageToUpdate);

        // Update the product data in Firebase
        try {
          await update(productRef, {
            name: selectedProduct.value.name,
            desc: selectedProduct.value.desc,
            price: selectedProduct.value.price,
            stock: selectedProduct.value.stock,
            image: imageToUpdate,
            rak: selectedProduct.value.rak, // Include any other properties you have
            inventoryStatus: selectedProduct.value.inventoryStatus, // Adjust according to your schema
          });

          console.log("Product updated successfully!");
          toast.add({
            severity: "success",
            summary: "Product updated",
            detail: `${selectedProduct.value.name} has been updated.`,
            group: "tr",
          });

          // Close the dialog after updating
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

    // Function to cancel editing
    const cancelEdit = () => {
      isEditDialogVisible.value = false; // Close the dialog without saving
      loading.value = false;
    };

    // Open Add New Product Dialog
    const openAddNewProductDialog = () => {
      isAddNewDialogVisible.value = true;
    };

    // Close Add New Product Dialog
    const closeAddNewProductDialog = () => {
      isAddNewDialogVisible.value = false;
      loading.value = false;
    };

    // Save New Product to Firebase
    const saveNewProduct = async () => {
      loading.value = true;
      const { name, desc, price, rak, stock } = newProduct.value;

      // Validate product data
      if (!name || !desc || price <= 0 || stock <= 0 || !rak) {
        toast.add({
          severity: "error",
          summary: "Invalid Input",
          detail: "Please fill in all fields correctly.",
          group: "tr",
          life: 3000,
        });
        loading.value = false; // Hide loading indicator on error
        return;
      }

      let imageUrl = "";

      // Handle image upload if a file is selected
      if (files.value.length > 0) {
        const file = files.value[0];
        const storage = getStorage();
        const storageRef = storRef(storage, `products/${file.name}`);

        try {
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          imageUrl = downloadURL;
        } catch (error) {
          toast.add({
            severity: "error",
            summary: "Upload Error",
            detail: "Failed to upload product image.",
            group: "tr",
            life: 3000,
          });
          loading.value = false; // Hide loading indicator on error
          console.log("Error uploading image:", error);
          return;
        }
      }

      // Get the last product ID and increment it
      const productsRef = dbRef(db, "products");
      try {
        const snapshot = await get(productsRef);
        let lastId = 0;
        if (snapshot.exists()) {
          const products = snapshot.val();
          const productIds = Object.keys(products);
          if (productIds.length > 0) {
            lastId = Math.max(...productIds.map((id) => parseInt(id, 10)));
          }
        }

        const newProductId = lastId + 1;

        // Create product object
        const newProductData = {
          name,
          id: newProductId,
          desc,
          price,
          stock,
          rak,
          image: imageUrl,
          inventoryStatus: "INSTOCK", // Default status
        };

        console.log("Saving new product with ID:", newProductId);

        // Save new product with incremented ID
        const newProductRef = dbRef(db, `products/${newProductId}`);
        await set(newProductRef, newProductData);

        toast.add({
          severity: "success",
          summary: "Product Added",
          detail: "The new product has been added successfully.",
          group: "tr",
        });
        closeAddNewProductDialog(); // Close the dialog after saving
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

    // Delete Product
    const deleteProduct = (product) => {
      const productRef = dbRef(db, `products/${product.id}`);
      console.log(product.id);
      confirm.require({
        message: `Do you want to delete ${product.name}?`,
        header: "Danger Zone",
        icon: "pi pi-info-circle",
        rejectLabel: "Cancel",
        rejectProps: {
          label: "Cancel",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Delete",
          severity: "danger",
        },
        accept: () => {
          remove(productRef)
            .then(() => {
              // Handle successful deletion
              toast.add({
                severity: "success",
                summary: "Product deleted",
                detail: `${product.name} has been removed.`,
                group: "tr",
              });
            })
            .catch((error) => {
              // Handle error
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
      const existingItem = cartItems.value.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += 1; // Increment quantity if item already in cart
      } else {
        cartItems.value.push({ product, quantity: 1 }); // Add new item to cart
      }

      cartCount.value += 1; // Increment cart count
      calculateTotalPayment(); // Recalculate total payment
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
      const cartIcon = document.querySelector(".pi-shopping-cart"); // Elemen ikon keranjang

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
        }, 700);
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

      return results;
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
    });

    return {
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
    };
  },
};
</script>

<style>
.animating-product {
  z-index: 1100;
  pointer-events: none;
}
</style>
