import { boot } from "quasar/wrappers";
import { authManager } from "src/services";
import { useAuthStore } from "src/stores/auth";

export default boot(({ router }) => {
  const auth = useAuthStore();

  authManager.onLogout(() => {
    void router.push({ name: "login" });
  });

  router.beforeEach(async (to) => {
    const isAuthenticated = await auth.check();

    if (to.meta.requiresAuth && !isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    if (to.meta.guestOnly && isAuthenticated) {
      return { name: "/" };
    }
  });
});
