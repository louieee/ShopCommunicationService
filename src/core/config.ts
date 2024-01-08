
export class Settings{
    static JWT_ALGORITHM : string = "HS256";
    static JWT_ACCESS_TOKEN_EXPIRY: number = 30;
    static JWT_REFRESH_TOKEN_EXPIRY: number = 60 * 24 * 7;
    static JWT_SECRET_KEY: string|undefined = process.env.JWT_SECRET_KEY;
    static SECRET_KEY: string|undefined = process.env.SECRET_KEY||"ML-4GicYUr_ECiC2T08VfwDQwbZfDDC3osDomSMcX_Q";
    static CORS_ALLOW_HEADERS: string[] = ["*"];
    static CORS_ORIGINS: string[] = ["*"];
    static CORS_ALLOW_METHODS: string[] = ["*"];
    static CORS_ALLOW_CREDENTIALS: boolean = true;
    static CELERY_BROKER = "redis://localhost:6379/0";
    static CELERY_BACKEND = "redis://localhost:6379/0";
    static CELERY_RESULT_EXPIRY = 3600;
    static CELERY_TIMEZONE = "UTC";

}
