interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // add more variables as needed...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
