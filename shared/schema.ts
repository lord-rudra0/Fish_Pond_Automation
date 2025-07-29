import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ph: real("ph"),
  waterLevel: real("water_level"),
  temperature: real("temperature"),
  nh3: real("nh3"),
  turbidity: real("turbidity"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const thresholds = pgTable("thresholds", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sensorType: text("sensor_type").notNull(), // 'ph', 'waterLevel', 'temperature', 'nh3', 'turbidity'
  minValue: real("min_value"),
  maxValue: real("max_value"),
  alertEnabled: boolean("alert_enabled").default(true).notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sensorType: text("sensor_type").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'normal', 'warning', 'critical'
  value: real("value"),
  threshold: real("threshold"),
  acknowledged: boolean("acknowledged").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertThresholdSchema = createInsertSchema(thresholds).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SensorData = typeof sensorData.$inferSelect;
export type InsertThreshold = z.infer<typeof insertThresholdSchema>;
export type Threshold = typeof thresholds.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
