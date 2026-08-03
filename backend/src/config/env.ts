import dotenv from "dotenv";

dotenv.config({ quiet: true });

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.TZ = process.env.TZ || "America/La_Paz";

const bool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
};

const isDevelopment = process.env.NODE_ENV === "development";

export const env = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT || 8080),
  httpLogging: bool(process.env.HTTP_LOGGING, isDevelopment),
  corsOrigin: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    dialect: process.env.DB_DIALECT || "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "168-db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    logging: bool(process.env.DB_LOGGING, false),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change_me",
    issuer: process.env.JWT_ISSUER || "http://localhost:8080",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshDays: Number(process.env.JWT_REFRESH_DAYS || 30),
  },
  securitySeed: {
    enabled: bool(process.env.SECURITY_SEED_ENABLED),
    email: process.env.SECURITY_SEED_EMAIL || "",
    password: process.env.SECURITY_SEED_PASSWORD || "",
    firstName: process.env.SECURITY_SEED_FIRST_NAME || "Super Administrador",
    firstLastName: process.env.SECURITY_SEED_FIRST_LAST_NAME || "Super",
    secondLastName: process.env.SECURITY_SEED_SECOND_LAST_NAME || "Admin",
  },
  storage: {
    localDir: process.env.STORAGE_LOCAL_DIR || "uploads",
    publicUrl:
      process.env.STORAGE_PUBLIC_URL ||
      "http://localhost:8080/api/storage/file",
  },
} as const;
