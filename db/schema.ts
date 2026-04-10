import { pgTable, serial, real, integer, timestamp } from "drizzle-orm/pg-core";

export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  ldr: real("ldr").notNull(),
  fsr: real("fsr").notNull(),
  pir: integer("pir").notNull().default(0),
  distance: real("distance").notNull(),
  temp: real("temp").notNull(),
  hum: real("hum").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SensorReading = typeof sensorReadings.$inferSelect;
export type NewSensorReading = typeof sensorReadings.$inferInsert;
