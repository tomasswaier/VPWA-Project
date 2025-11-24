import type { Pinia } from "pinia";
import { Manager } from "socket.io-client";
import type { Socket } from "socket.io-client";
// Instead of BootCallback typing (removed)
import type { App } from "vue";

import { authManager } from ".";

export type BootParams = {
  app: App; // Vue application instance
  store?: Pinia; // Optional Pinia store instance
};
export interface SocketManagerContract {
  namespace: string;
  readonly socket: Socket;
  subscribe(): void;
  destroy(): void;
}

export interface SocketManagerConstructorContract {
  new (namespace: string): SocketManagerContract;
  getManager(): Manager;
  createManager(uri: string): Manager;
  addInstance(instance: SocketManagerContract): void;
  destroyInstance(instance: SocketManagerContract): void;
}

interface SocketError extends Error {
  data?: unknown;
}

const DEBUG = import.meta.env.MODE === "development";

export abstract class SocketManager implements SocketManagerContract {
  private static manager: Manager;
  private static instances: SocketManagerContract[] = [];
  private static namespaces: Set<string> = new Set();
  private static params: BootParams | null = null;

  public static getManager() {
    if (!this.manager) {
      throw new Error(
        'Socket.io Manager not created. Call "SocketManager.createManager(uri)" in main.ts',
      );
    }
    return this.manager;
  }

  public static createManager(uri?: string): Manager {
    this.manager = new Manager(uri, { autoConnect: false });
    return this.manager;
  }

  public static addInstance(instance: SocketManagerContract): void {
    if (this.namespaces.has(instance.namespace)) {
      throw new Error(
        `Duplicate socket manager for namespace "${instance.namespace}".`,
      );
    }

    this.namespaces.add(instance.namespace);

    if (this.params !== null) {
      this.bootInstance(instance);
    } else {
      this.instances.push(instance);
    }
  }
  public static destroyInstance(
    instance: SocketManagerContract & { $socket: Socket | null },
  ): void {
    this.instances = this.instances.filter((socket) => socket !== instance);
    this.namespaces.delete(instance.namespace);
    // disconnect and clean socket
    instance.socket.disconnect();
    instance.socket.removeAllListeners();
    instance.$socket = null;
  }
  private static bootInstance(instance: SocketManagerContract): void {
    instance.subscribe();
    instance.socket.connect();
  }

  public static boot(params: BootParams): void {
    if (this.params) {
      throw new Error("SocketManager already booted. Call only once.");
    }

    this.params = params;
    this.instances.forEach((instance) => this.bootInstance(instance));
    this.instances = [];
  }

  private $socket: Socket | null = null;

  public get socket(): Socket {
    if (!this.$socket) {
      this.$socket = this.socketWithAuth();
    }
    return this.$socket;
  }

  constructor(public namespace: string) {
    (this.constructor as SocketManagerConstructorContract).addInstance(this);
  }

  private socketWithAuth(): Socket {
    const io = (this.constructor as SocketManagerConstructorContract)
      .getManager();

    const socket = io.socket(this.namespace, {
      auth: { token: authManager.getToken() },
    });

    socket.on("connect_error", (err: SocketError) => {
      if (DEBUG) {
        console.error(
          `${this.namespace} [connect_error]`,
          err.message,
          err.data,
        );
      }

      if (err.data) {
        const unsubscribe = authManager.onChange((token) => {
          socket.auth = { token };
          unsubscribe();
          socket.connect();
        });
      }
    });

    if (DEBUG) {
      socket.on("connect", () => console.info(`${this.namespace} [connect]`));
      socket.on(
        "disconnect",
        (reason) => console.info(`${this.namespace} [disconnect]`, reason),
      );
      socket.on(
        "error",
        (err: Error) => console.error(`${this.namespace} [error]`, err.message),
      );
      socket.onAny((event, ...args) =>
        console.info(`${this.namespace} [${event}]`, args)
      );
    }

    return socket;
  }

  protected emitAsync<T>(event: string, ...args: unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        event,
        ...args,
        (
          error: Error | null,
          response: T,
        ) => (error ? reject(error) : resolve(response)),
      );
    });
  }

  public destroy(): void {
    (this.constructor as SocketManagerConstructorContract)
      .destroyInstance(this);
  }

  public abstract subscribe(): void;
}
