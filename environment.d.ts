declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_USER: string,
            MONGO_PORT: string,
            MONGO_PASSWORD: string,
            MONGO_HOST: string,
            MONGO_DATABASE: string,

            BSC_PROVIDER_RPC: string,
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }