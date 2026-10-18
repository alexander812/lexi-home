/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_AMPLITUDE_KEY?: string;
  readonly PUBLIC_AMPLITUDE_SERVER_ZONE?: 'US' | 'EU';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
