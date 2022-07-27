declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.gif' {
  const url: string;
  export default url;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}
