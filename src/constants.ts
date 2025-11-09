import dotenv from "dotenv";

const env =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: env });

export const port = process.env?.PORT || 8000;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const FRONTEND_URL = process.env.FRONTEND_URL;

export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
export const MIN_FILES_REQUIRED = 5;
export const MAX_FILES_ALLOWED = 20;
export const ORDER_AMOUNT = 10;
export const PRICE_IN_USD = 29.99;
// export const PRICE_IN_USD_AFTER_REFERRAL = "29.99";
export const PRICE_IN_INR = 2599;
// export const PRICE_IN_INR = 3;
// export const PRICE_IN_INR_AFTER_REFERRAL = 2600;
export const MINIMUM_NUMBER_OF_IMAGES_TO_GENERATE = 50;

//port

// Cashfree environment variables
export const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
export const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
export const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL!;

// Paypal
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
export const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;

// AWS
export const AWS_REGION = process.env.AWS_REGION;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

// Astria
export const ASTRIA_BASE_URL = process.env.ASTRIA_BASE_URL;
export const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY;

// Telegram
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// mailgun
export const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY!;

//Database
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_HOST = process.env.DB_HOST;

//openai
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

//replicate
export const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
