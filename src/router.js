import { createRouter, createWebHistory } from "vue-router";

import Home from "./components/Home.vue";
import Admin from "./components/Admin.vue";
import Login from "./components/Login.vue";
import StatusMonitor from "./components/StatusMonitor.vue";

const routes = [
  {
    path: "/:userId",
    name: "Home",
    component: Home,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: {requiresAuth: true}, 
  }, 
  {
    path: "/login",
    name: "Login",
    component: Login, 
  }, 
  {
    path: "/status", 
    name: "Status",
    component: StatusMonitor, 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard untuk memeriksa autentikasi
router.beforeEach((to, from, next) => {
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  if (to.matched.some(record => record.meta.requiresAuth) && !loggedInUser) {
    next('/login'); // Redirect ke login jika akses admin tanpa login
  } else {
    next();
  }
});

export default router;
