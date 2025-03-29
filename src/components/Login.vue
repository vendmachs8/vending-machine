<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
  
        <!-- Jika sudah login -->
        <div v-if="isLoggedIn">
          <p class="text-lg font-semibold text-gray-700 mb-4 text-center">
            Hai {{ loggedInUser }}! Anda sudah login.
          </p>
          <Button
            label="Logout"
            class="w-full p-button-danger"
            @click="handleLogout"
          />
        </div>
  
        <!-- Jika belum login -->
        <form v-else @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium mb-1">Username</label>
            <InputText
              id="username"
              v-model="username"
              placeholder="Enter username"
              class="w-full"
              required
            />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <InputText
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter password"
              class="w-full"
              required
            />
          </div>
          <Button
            label="Login"
            type="submit"
            class="w-full p-button-primary"
            :loading="loading"
          />
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from "vue";
  import { db } from "../firebase";
  import { ref as dbRef, get, set, push, update } from "firebase/database";
  import { useRouter } from "vue-router";
  
  export default {
    name: "Login",
    setup() {
      const router = useRouter();
      const username = ref("");
      const password = ref("");
      const loading = ref(false);
      const loggedInUser = ref(localStorage.getItem("loggedInUser") || "");
      const isLoggedIn = computed(() => !!loggedInUser.value);
  
      const handleLogin = async () => {
        loading.value = true;
        const userRef = dbRef(db, `users/${username.value}`);
        const statusChangesRef = dbRef(db, `users/${username.value}/statusChanges`);
  
        try {
          const snapshot = await get(userRef);
          let userData = snapshot.exists() ? snapshot.val() : null;
  
          if (!userData) {
            // Akun baru: Buat data awal dengan status S003
            await set(userRef, {
              username: username.value,
              password: password.value,
              status: "S003",
              statusChanges: {}, // Inisialisasi kosong untuk ipaymkun baru
            });
          } else {
            // Akun lama: Hanya update status, pertahankan data lain
            await update(userRef, {
              status: "S003", // Hanya update status
            });
          }
  
          // Tambah log perubahan status
          await push(statusChangesRef, {
            status: "S003",
            timestamp: new Date().toISOString(),
          });
  
          localStorage.setItem("loggedInUser", username.value);
          loggedInUser.value = username.value;
          router.push({ name: "Admin" });
        } catch (error) {
          console.error("Error during login:", error);
        } finally {
          loading.value = false;
        }
      };
  
      const handleLogout = async () => {
        const userRef = dbRef(db, `users/${loggedInUser.value}`);
        const statusChangesRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
        try {
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            await update(userRef, {
              status: "S002", // Hanya update status
            });
            // Tambah log perubahan status
            await push(statusChangesRef, {
              status: "S002",
              timestamp: new Date().toISOString(),
            });
          }
          localStorage.removeItem("loggedInUser");
          loggedInUser.value = "";
          username.value = "";
          password.value = "";
        } catch (error) {
          console.error("Error during logout:", error);
        }
      };
  
      return {
        username,
        password,
        handleLogin,
        handleLogout,
        loading,
        loggedInUser,
        isLoggedIn,
      };
    },
  };
  </script>
  
  <style scoped>
  .text-gray-700 {
    color: #374151;
  }
  </style>