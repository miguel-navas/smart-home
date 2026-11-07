import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Legacy managed-MySQL simulation table from the first backend attempt.
 * Retained with its applied migration/data; the current development simulator uses SQLite.
 */
export const smartHomeDevices = mysqlTable("smart_home_devices", {
  deviceKey: varchar("deviceKey", { length: 32 }).primaryKey(),
  lightOn: boolean("lightOn").default(false).notNull(),
  climateOn: boolean("climateOn").default(false).notNull(),
  temperature: int("temperature").default(22).notNull(),
  hoodOn: boolean("hoodOn").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Legacy MySQL revision row; retained for migration history and not read by the SQLite simulator. */
export const smartHomeSync = mysqlTable("smart_home_sync", {
  id: int("id").primaryKey(),
  revision: int("revision").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmartHomeDevice = typeof smartHomeDevices.$inferSelect;
export type SmartHomeSync = typeof smartHomeSync.$inferSelect;
