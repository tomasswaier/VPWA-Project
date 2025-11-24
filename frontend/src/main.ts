import { createPinia } from "pinia";
import { Quasar } from "quasar";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import { SocketManager } from "./services/SocketManager";

const app = createApp(App);
const pinia = createPinia();

app.use(Quasar);
app.use(pinia);
app.use(router);

app.mount("#app");

SocketManager.createManager("http://localhost:3333");
SocketManager.boot({ app, store: pinia });
