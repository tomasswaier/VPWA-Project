import { boot } from "quasar/wrappers";
import type { Router } from "vue-router";

export default boot(
  ({ router }: { router: Router }) => {
    router.beforeEach((to, from, next) => {
      const publicRoutes = ["/auth/login", "/auth/register"];

      const token = localStorage.getItem("access_token");

      if (!token && !publicRoutes.includes(to.path)) {
        return next("/auth/login");
      }

      next();
    });
  },
);
