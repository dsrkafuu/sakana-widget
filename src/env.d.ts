declare type RequiredDeep<T> = {
  [K in keyof T]: RequiredDeep<T[K]>;
} & Required<T>;

declare module '*.css' {
  const css: string;
  export default css;
}
declare module '*.sass' {
  const css: string;
  export default css;
}
declare module '*.scss' {
  const css: string;
  export default css;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
