import { boot } from "quasar/wrappers";
import type { Manager } from "socket.io-client";
import PrivateService from "src/services/PrivateService";
import { SocketManager } from "src/services/SocketManager";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $io: Manager;
  }
}

// create socket.io manager
const io = SocketManager.createManager("http://localhost:3333");

export default boot((params) => {
  params.app.config.globalProperties.$io = io;
  // boot socket manager here to allow to subscribe sockets to events and use
  // store
  SocketManager.boot(params);
  PrivateService.boot();
});
export { io };
