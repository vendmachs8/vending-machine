<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Admin Access</h2>

      <!-- Jika sudah login sepenuhnya -->
      <div v-if="isFullyAuthenticated">
        <p class="text-lg font-semibold text-gray-700 mb-4 text-center">
          Hai {{ loggedInUser }}! Anda sudah login sebagai admin.
        </p>
        <Button label="Logout" class="w-full p-button-danger" @click="handleLogout" />
        <Button label="Go to Admin" class="w-full p-button-primary mt-2" @click="goToAdmin" />
      </div>

      <!-- Form Login atau Register -->
      <div v-else>
        <div class="flex justify-center mb-4">
          <Button label="Login" :class="{ 'p-button-primary': !isRegisterMode, 'p-button-secondary': isRegisterMode }" @click="isRegisterMode = false" />
          <Button label="Register" :class="{ 'p-button-primary': isRegisterMode, 'p-button-secondary': !isRegisterMode }" @click="isRegisterMode = true" class="ml-2" />
        </div>

        <form v-if="!isRegisterMode" @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium mb-1">Username</label>
            <InputText id="username" v-model="username" placeholder="Enter username" class="w-full" required />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <InputText id="password" v-model="password" type="password" placeholder="Enter password" class="w-full" required />
          </div>
          <Button label="Login" type="submit" class="w-full p-button-primary" :loading="loading" />
        </form>

        <form v-else @submit.prevent="handleRegister">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium mb-1">Username</label>
            <InputText id="username" v-model="username" placeholder="Enter username" class="w-full" required />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <InputText id="password" v-model="password" type="password" placeholder="Enter password" class="w-full" required />
          </div>
          <Button label="Register" type="submit" class="w-full p-button-primary" :loading="loading" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, get, set, update, push } from 'firebase/database';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

export default {
  setup() {
    const router = useRouter();
    const toast = useToast();
    const username = ref('');
    const password = ref('');
    const loading = ref(false);
    const isRegisterMode = ref(false); // Toggle antara login dan register
    const loggedInUser = ref(localStorage.getItem('loggedInUser') || '');
    const isFullyAuthenticated = computed(() => localStorage.getItem('isFullyAuthenticated') === 'true');

    // Fungsi Login
    const handleLogin = async () => {
      if (!validateInputs()) return;
      loading.value = true;
      const userRef = dbRef(db, `users/${username.value}`);
      const statusChangesRef = dbRef(db, `users/${username.value}/statusChanges`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.password === password.value) {
            await update(userRef, { status: 'S003' });
            await push(statusChangesRef, { status: 'S003', timestamp: new Date().toISOString() });
            localStorage.setItem('loggedInUser', username.value);
            localStorage.setItem('isFullyAuthenticated', 'true');
            loggedInUser.value = username.value;
            router.push('/admin');
            toast.add({ severity: 'success', summary: 'Login Success', detail: 'Welcome to Admin!', life: 3000 });
          } else {
            toast.add({ severity: 'error', summary: 'Login Failed', detail: 'Incorrect password', life: 3000 });
          }
        } else {
          toast.add({ severity: 'error', summary: 'Login Failed', detail: 'User not found', life: 3000 });
        }
      } catch (error) {
        console.error('Error during login:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Login failed', life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    // Fungsi Register
    const handleRegister = async () => {
      if (!validateInputs()) return;
      loading.value = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/check-username`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value })
        });
        const { exists } = await response.json();
        if (exists) {
          toast.add({ severity: 'error', summary: 'Registration Failed', detail: 'Username already exists', life: 3000 });
          loading.value = false;
          return;
        }

        const userRef = dbRef(db, `users/${username.value}`);
        await set(userRef, {
          username: username.value,
          password: password.value,
          status: 'S001',
          createdAt: new Date().toISOString(),
        });
        toast.add({ severity: 'success', summary: 'Registration Success', detail: 'Account created! Please login.', life: 3000 });
        isRegisterMode.value = false;
        username.value = '';
        password.value = '';
      } catch (error) {
        console.error('Error during registration:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Registration failed', life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    // Fungsi Logout
    const handleLogout = async () => {
      const userRef = dbRef(db, `users/${loggedInUser.value}`);
      const statusChangesRef = dbRef(db, `users/${loggedInUser.value}/statusChanges`);
      try {
        await update(userRef, { status: 'S002' });
        await push(statusChangesRef, { status: 'S002', timestamp: new Date().toISOString() });
        localStorage.removeItem('isFullyAuthenticated');
        if (!router.currentRoute.value.params.userId) {
          localStorage.removeItem('loggedInUser');
          loggedInUser.value = '';
        }
        username.value = '';
        password.value = '';
        router.push('/');
        toast.add({ severity: 'info', summary: 'Logged Out', detail: 'You have been logged out from admin', life: 3000 });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    // Validasi Input
    const validateInputs = () => {
      if (!username.value || username.value.length < 3) {
        toast.add({ severity: 'error', summary: 'Invalid Username', detail: 'Username must be at least 3 characters', life: 3000 });
        return false;
      }
      if (!password.value || password.value.length < 6) {
        toast.add({ severity: 'error', summary: 'Invalid Password', detail: 'Password must be at least 6 characters', life: 3000 });
        return false;
      }
      return true;
    };

    // Navigasi ke halaman admin
    const goToAdmin = () => {
      router.push('/admin');
    };

    

    return {
      username,
      password,
      handleLogin,
      handleLogout,
      handleRegister,
      loading,
      loggedInUser,
      isFullyAuthenticated,
      isRegisterMode,
      goToAdmin,
    };
  },
};
</script>