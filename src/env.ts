import * as dotenv from "dotenv";
import * as path from "path";

import * as pkg from "../package.json";
import {
  getOsEnv, getOsEnvOptional, normalizePort, toBool, toNumber,
} from "./lib/env";

/**
 * Load .env file or for tests the .env.test file.
 */
const ext = {
  test: ".test",
  development: ".dev",
  production: ".prod",
}[process.env.NODE_ENV];

dotenv.config({ path: path.join(process.cwd(), `.env${ext}`) });

/**
 * Environment variables
 */
export const env = {
  node: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development",
  app: {
    name: getOsEnv("APP_NAME"),
    version: (pkg as any).version,
    description: (pkg as any).description,
    host: getOsEnv("APP_HOST"),
    schema: getOsEnv("APP_SCHEMA"),
    routePrefix: getOsEnv("APP_ROUTE_PREFIX"),
    port: normalizePort(process.env.PORT || getOsEnv("APP_PORT")),
    allowSignup: toBool(getOsEnv("APP_ALLOW_SIGNUP")),
    jtwSecret: getOsEnv("APP_JWT_SECRET"),
    jtwExpires: getOsEnv("APP_JWT_EXPIRES"),
  },
  s3: {
    userName: getOsEnv("S3_USER"),
    bucketName: getOsEnv("S3_BUCKET_NAME"),
    accessKeyId: getOsEnv("S3_ACCESS_KEY"),
    secretAccessKey: getOsEnv("S3_SECRET_KEY"),
  },
  log: {
    level: getOsEnv("LOG_LEVEL"),
    json: toBool(getOsEnvOptional("LOG_JSON")),
    output: getOsEnv("LOG_OUTPUT"),
  },
  db: {
    name: "default",
    type: getOsEnv("TYPEORM_CONNECTION"),
    host: getOsEnvOptional("TYPEORM_HOST"),
    port: toNumber(getOsEnvOptional("TYPEORM_PORT")),
    username: getOsEnvOptional("TYPEORM_USERNAME"),
    password: getOsEnvOptional("TYPEORM_PASSWORD"),
    database: getOsEnv("TYPEORM_DATABASE"),
    synchronize: toBool(getOsEnvOptional("TYPEORM_SYNCHRONIZE")),
    logging: getOsEnv("TYPEORM_LOGGING"),
    entities: getOsEnv("TYPEORM_ENTITIES").split(","),
    migrations: getOsEnv("TYPEORM_MIGRATIONS").split(","),
    subscribers: getOsEnv("TYPEORM_SUBSCRIBERS").split(","),
    cli: {
      entitiesDir: getOsEnv("TYPEORM_CLI_ENTITIES_DIR"),
      migrationsDir: getOsEnv("TYPEORM_CLI_MIGRATIONS_DIR"),
      subscribersDir: getOsEnv("TYPEORM_CLI_SUBSCRIBERS_DIR"),
    },
  },
};
