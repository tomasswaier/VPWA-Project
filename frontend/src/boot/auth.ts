import { boot } from "quasar/wrappers";
import type { Router } from "vue-router";

export default boot(
  ({ router }: { router: Router }) => {
    router.beforeEach((to, from, next) => {
      const publicRoutes = ["/login", "/register"];

      const token = localStorage.getItem("access_token");

      if (!token && !publicRoutes.includes(to.path)) {
        return next("/login");
      }

      next();
    });
  },
);
