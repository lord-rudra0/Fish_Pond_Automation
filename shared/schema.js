const { sql } = require("drizzle-orm");
const { pgTable, text, varchar, timestamp, real, boolean, serial } = require("drizzle-orm/pg-core");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ph: real("ph"),
  waterLevel: real("water_level"),
  temperature: real("temperature"),
  nh3: real("nh3"),
  turbidity: real("turbidity"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

const thresholds = pgTable("thresholds", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sensorType: text("sensor_type").notNull(), // 'ph', 'waterLevel', 'temperature', 'nh3', 'turbidity'
  minValue: real("min_value"),
  maxValue: real("max_value"),
  alertEnabled: boolean("alert_enabled").default(true).notNull(),
});

const alerts = pgTable("alerts", {
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

const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

const insertThresholdSchema = createInsertSchema(thresholds).omit({
  id: true,
});

const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

module.exports = {
  users,
  sensorData,
  thresholds,
  alerts,
  insertUserSchema,
  insertSensorDataSchema,
  insertThresholdSchema,
  insertAlertSchema
};