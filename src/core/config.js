"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
class Settings {
}
exports.Settings = Settings;
Settings.JWT_ALGORITHM = "HS256";
Settings.JWT_ACCESS_TOKEN_EXPIRY = 30;
Settings.JWT_REFRESH_TOKEN_EXPIRY = 60 * 24 * 7;
Settings.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
Settings.SECRET_KEY = process.env.SECRET_KEY || "ML-4GicYUr_ECiC2T08VfwDQwbZfDDC3osDomSMcX_Q";
Settings.CORS_ALLOW_HEADERS = ["*"];
Settings.CORS_ORIGINS = ["*"];
Settings.CORS_ALLOW_METHODS = ["*"];
Settings.CORS_ALLOW_CREDENTIALS = true;
Settings.CELERY_BROKER = "redis://localhost:6379/0";
Settings.CELERY_BACKEND = "redis://localhost:6379/0";
Settings.CELERY_RESULT_EXPIRY = 3600;
Settings.CELERY_TIMEZONE = "UTC";
