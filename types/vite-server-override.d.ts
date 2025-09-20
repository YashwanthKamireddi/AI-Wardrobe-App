declare module 'vite' {
  interface ServerOptions {
    // widen to accept the inferred boolean
    allowedHosts?: true | string[] | boolean;
  }
}