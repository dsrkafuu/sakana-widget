/// <reference types="tsdown/client" />

declare module '*.scss' {}

declare module '*.png' {
  const base64: string;
  export default base64;
}

declare module '*.svg' {
  const text: string;
  export default text;
}
