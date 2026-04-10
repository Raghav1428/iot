import express from "express";
import cors from "cors";
import { db } from "./db";
import { sensorReadings } from "./db/schema";
import { desc, sql, gte } from "drizzle-orm";

const app = express();

app.use(cors());
app.use(express.json());

// -------- ESP32 sends data here --------
app.post("/update", async (req, res) => {
  try {
    const { ldr, fsr, pir, distance, temp, hum } = req.body;

    const [inserted] = await db
      .insert(sensorReadings)
      .values({ ldr, fsr, pir: pir ?? 0, distance, temp, hum })
      .returning();

    console.log("📥 Received & stored:", inserted);
    res.json({ status: "success", data: inserted });
  } catch (err) {
    console.error("❌ Error inserting sensor data:", err);
    res.status(500).json({ status: "error", message: "Failed to store data" });
  }
});

// -------- Latest sensor reading --------
app.get("/data", async (_req, res) => {
  try {
    const [latest] = await db
      .select()
      .from(sensorReadings)
      .orderBy(desc(sensorReadings.createdAt))
      .limit(1);

    res.json(latest ?? null);
  } catch (err) {
    console.error("❌ Error fetching latest data:", err);
    res.status(500).json({ status: "error" });
  }
});

// -------- Historical readings --------
app.get("/data/history", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);

    const readings = await db
      .select()
      .from(sensorReadings)
      .orderBy(desc(sensorReadings.createdAt))
      .limit(limit);

    res.json(readings);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ status: "error" });
  }
});

// -------- Aggregated stats --------
app.get("/data/stats", async (req, res) => {
  try {
    const hours = Number(req.query.hours) || 1;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [stats] = await db
      .select({
        count: sql<number>`count(*)::int`,
        avgTemp: sql<number>`round(avg(${sensorReadings.temp})::numeric, 2)`,
        minTemp: sql<number>`min(${sensorReadings.temp})`,
        maxTemp: sql<number>`max(${sensorReadings.temp})`,
        avgHum: sql<number>`round(avg(${sensorReadings.hum})::numeric, 2)`,
        minHum: sql<number>`min(${sensorReadings.hum})`,
        maxHum: sql<number>`max(${sensorReadings.hum})`,
        avgLdr: sql<number>`round(avg(${sensorReadings.ldr})::numeric, 2)`,
        avgFsr: sql<number>`round(avg(${sensorReadings.fsr})::numeric, 2)`,
        avgDistance: sql<number>`round(avg(${sensorReadings.distance})::numeric, 2)`,
      })
      .from(sensorReadings)
      .where(gte(sensorReadings.createdAt, since));

    res.json({ hours, since: since.toISOString(), ...stats });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ status: "error" });
  }
});

// -------- Health check --------
app.get("/", (_req, res) => {
  res.send("✅ Server is running!");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});