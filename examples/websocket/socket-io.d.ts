declare module "socket.io" {
  import type { Server as HttpServer } from "http";

  interface ServerOptions {
    path?: string;
    cors?: { origin?: string | string[]; methods?: string[] };
    pingTimeout?: number;
    pingInterval?: number;
  }

  interface Socket {
    id: string;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
  }

  class Server {
    constructor(httpServer: HttpServer, options?: ServerOptions);
    on(event: string, listener: (socket: Socket) => void): this;
    emit(event: string, ...args: any[]): this;
  }

  export { Server };
}

declare module "socket.io-client" {
  interface ManagerOptions {
    transports?: string[];
    forceNew?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
  }

  interface Socket {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): this;
  }

  function io(uri?: string, options?: ManagerOptions): Socket;
  export { io };
}
