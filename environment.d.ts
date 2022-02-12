declare global
{
    namespace NodeJS
    {
        interface ProcessEnv
        {
            MONGO_DATABASE_URL: string;
            TESTING_MONGO_DATABASE_URL: string;

            APP_MODE: "api_only" | "api_sync" | "fast_sync_no_api";
            API_PORT: string;
            JWT_SECRET: string;

            THROW_RANDOM_ERRORS: string;
            THROW_RANDOM_ERRORS_RATE: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script), convert it into a module by adding an empty export statement.
export { }
