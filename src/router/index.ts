import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Two from "../views/Two.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/",
      name: "two",
      component: Two,
    },
  ],
});

export default router;
