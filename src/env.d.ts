/// <reference types="vite/client" />
/// <reference types="wxt/client" />

declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}
