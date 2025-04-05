<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-4xl">
      <h2 class="text-2xl font-bold mb-4 text-center">Status Monitor</h2>

      <!-- Tombol Reset All Data Log -->
      <div class="mb-4 flex justify-center">
        <Button
          label="Reset All Data Log"
          class="p-button-danger"
          @click="resetAllLogs"
        />
        <Dropdown 
          v-model="filterType" 
          :options="filterOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Filter Type" 
          class="w-48" 
        />
      </div>

      <!-- Tabel untuk menampilkan data -->
      <div v-if="users.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-2">Username</th>
              <th class="px-4 py-2">Current Status</th>
              <th class="px-4 py-2">Status Description</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in users" :key="user.username">
              <tr class="bg-white border-b">
                <td class="px-4 py-2 align-top flex items-center gap-2">
                  <button
                    @click="toggleHistory(user.username)"
                    class="text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <i
                      :class="isHistoryVisible(user.username) ? 'pi pi-minus' : 'pi pi-plus'"
                      style="font-size: 1rem"
                    ></i>
                  </button>
                  {{ user.username }}
                </td>
                <td class="px-4 py-2 align-top">{{ user.status }}</td>
                <td class="px-4 py-2 align-top">{{ getStatusDescription(user.status) }}</td>
                <td class="px-4 py-2 align-top">
                  <button
                    @click="deleteUser(user.username)"
                    class="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <i class="pi pi-trash" style="font-size: 1rem"></i>
                  </button>
                </td>
              </tr>
              <!-- Baris tambahan untuk history -->
              <tr v-if="isHistoryVisible(user.username)" class="bg-gray-100">
                <td colspan="4" class="px-4 py-2">
                  <h4 class="text-sm font-semibold text-gray-600 mb-2">Status & Activity History:</h4>
                  <div v-if="sortedHistory(user.statusChanges).length > 0" class="flex flex-col gap-2">
                    <div
                      v-for="(entry, index) in sortedHistory(user.statusChanges)"
                      :key="entry.timestamp || index"
                      class="p-2 border-b border-gray-200 text-xs"
                    >
                      <p><strong>No:</strong> {{ index + 1 }}</p>
                      <p><strong>{{ entry.type === 'status' ? 'Status' : 'Activity' }}:</strong> {{ entry.code }}</p>
                      <p><strong>Description:</strong> {{ getStatusDescription(entry.code, entry) }}</p>
                      <p><strong>Timestamp:</strong> {{ entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Invalid Timestamp' }}</p>
                    </div>
                  </div>
                  <div v-else class="text-xs text-gray-500">
                    Tidak ada riwayat perubahan status atau aktivitas yang tersedia.
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500">
        Tidak ada data pengguna yang tersedia.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { db } from "../firebase";
import { ref as dbRef, onValue, off, update, get, remove } from "firebase/database";
import { useToast } from "primevue/usetoast";

export default {
  name: "StatusMonitor",
  setup() {
    const users = ref([]);
    const visibleHistories = ref({});
    const toast = useToast();
    const filterType = ref('all');
    const filterOptions = ref([
      { label: 'All', value: 'all' },
      { label: 'Status Only', value: 'status' },
      { label: 'Activities Only', value: 'activity' },
    ]);

    const getStatusDescription = (code, entry = {}) => {
      switch (code) {
        case "S001":
          return "Online-Run (Home)";
        case "S002":
          return "Offline";
        case "S003":
          return "Online-Setup (Admin)";
        case "A001":
          return "Test Connection";
        case "A002":
          return "Auto Refresh";
        case "A003":
          return "Press Cart Button (Pay)";
        case "A004":
          return entry.description ? `Add Product to Cart (${entry.description})` : "Add Product to Cart";
        case "A005":
          return "Complete Shopping Transaction";
        default:
          if (code && code.startsWith("Q")) {
            return entry.description || `OUT: Item Removed (Rak ${code.slice(1)})`;
          }
          if (code && code.startsWith("I")) {
            return entry.description || `IN: Item Modified (Rak ${code.slice(1)})`;
          }
          return "Unknown";
      }
    };
  
    const fetchUsersStatus = () => {
      const usersRef = dbRef(db, "users");
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          users.value = Object.keys(data).map((key) => ({
            username: data[key].username || key,
            status: data[key].status || "S002",
            statusChanges: { ...(data[key].statusChanges || {}), ...(data[key].activities || {}) },
          }));
          users.value.forEach((user) => {
            if (!(user.username in visibleHistories.value)) {
              visibleHistories.value[user.username] = false;
            }
          });
          console.log("Users fetched successfully:", users.value);
        } else {
          users.value = [];
          toast.add({ severity: "info", summary: "No Data", detail: "No users found in the database.", life: 3000 });
        }
      }, (error) => {
        console.error("Error fetching users:", error);
        toast.add({ severity: "error", summary: "Error", detail: "Failed to fetch user data.", life: 3000 });
      });
    };

    const resetAllLogs = async () => {
      const usersRef = dbRef(db, "users"); // Sesuaikan path
      try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const updates = {};
          for (const username in usersData) {
            updates[`${username}/statusChanges`] = null;
          }
          await update(usersRef, updates);
          toast.add({ severity: "success", summary: "Reset Success", detail: "All status logs have been reset.", life: 3000 });
          console.log("All status change logs have been reset.");
        } else {
          toast.add({ severity: "warn", summary: "No Data", detail: "No logs to reset.", life: 3000 });
        }
      } catch (error) {
        console.error("Error resetting logs:", error);
        toast.add({ severity: "error", summary: "Error", detail: "Failed to reset logs.", life: 3000 });
      }
    };

    const toggleHistory = (username) => {
      visibleHistories.value[username] = !visibleHistories.value[username];
      console.log(`Toggled history for ${username}, now visible: ${visibleHistories.value[username]}`);
    };

    const isHistoryVisible = (username) => {
      return visibleHistories.value[username] || false;
    };

    const sortedHistory = (statusChanges) => {
      if (!statusChanges || Object.keys(statusChanges).length === 0) return [];
      let filtered = Object.values(statusChanges).filter((entry) => entry.code && entry.type && entry.timestamp);
      if (filterType.value !== 'all') {
        filtered = filtered.filter((entry) => entry.type === filterType.value);
      }
      return filtered.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime() || 0;
        const dateB = new Date(b.timestamp).getTime() || 0;
        return dateA - dateB;
      });
    };

    const deleteUser = async (username) => {
      if (!username || typeof username !== "string") {
        toast.add({ severity: "error", summary: "Invalid Username", detail: "Cannot delete: Invalid username.", life: 3000 });
        console.error("Invalid username provided for deletion:", username);
        return;
      }

      if (!confirm(`Are you sure you want to delete the account "${username}"? This action cannot be undone.`)) {
        return;
      }

      const userRef = dbRef(db, `users/${username}`); // Sesuaikan path
      try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          toast.add({ severity: "warn", summary: "Not Found", detail: `User "${username}" does not exist.`, life: 3000 });
          console.warn(`User ${username} not found in database.`);
          return;
        }

        await remove(userRef);
        console.log(`User ${username} has been deleted successfully.`);
        toast.add({ severity: "success", summary: "Deleted", detail: `Account "${username}" has been deleted.`, life: 3000 });

        delete visibleHistories.value[username];
      } catch (error) {
        console.error(`Error deleting user ${username}:`, error);
        toast.add({ severity: "error", summary: "Error", detail: `Failed to delete "${username}": ${error.message}`, life: 3000 });
      }
    };

    onMounted(() => {
      console.log("StatusMonitor mounted, fetching users...");
      fetchUsersStatus();
    });

    onUnmounted(() => {
      const usersRef = dbRef(db, "users"); // Sesuaikan path
      off(usersRef);
      console.log("StatusMonitor unmounted, listener removed.");
    });

    return {
      users,
      getStatusDescription,
      resetAllLogs,
      toggleHistory,
      isHistoryVisible,
      sortedHistory,
      deleteUser,
      filterType, 
      filterOptions,
    };
  },
};
</script>

<style scoped>
/* Style tetap sama */
</style>