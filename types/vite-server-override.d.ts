import 'vite';

declare module 'vite' {
  interface ServerOptions {
    allowedHosts?: true | string[] | boolean;
  }
}