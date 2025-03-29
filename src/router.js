import { createRouter, createWebHistory } from "vue-router";

import Home from "./components/Home.vue";
import Admin from "./components/Admin.vue";
import Login from "./components/Login.vue";
import StatusMonitor from "./components/StatusMonitor.vue";
import ThankYou from "./components/ThankYou.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
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
  },
  {
    path: "/thank-you", 
    name: "ThankYou", 
    component: ThankYou 
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
