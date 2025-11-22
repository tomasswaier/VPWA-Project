import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import routes from "./routes";

const createHistory = process.env.VUE_ROUTER_MODE === "history"
  ? createWebHistory
  : createWebHashHistory;

const router = createRouter({
  history: createHistory(process.env.VUE_ROUTER_BASE),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
export default router;
