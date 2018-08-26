declare module '*.less' {
  interface StyleModule {
    [key: string]: string
  }

  const Style: StyleModule;

  export default Style;
}
