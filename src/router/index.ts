import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Two from "../views/Two.vue";
import Three from "../views/Three.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/two",
      name: "two",
      component: Two,
    },
    {
      path: "/",
      name: "three",
      component: Three,
    },
  ],
});

export default router;
