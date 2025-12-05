import express from "express";
import * as service from "../services/analytics.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [system, byType, byUrgency, topItems] = await Promise.all([
      service.getSystemStats(),
      service.getRequestsByType(),
      service.getRequestsByUrgency(),
      service.getTopRequestedItems()
    ]);

    res.json({
      system,
      byType,
      byUrgency,
      topItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const result = await service.getSearchAnalytics();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/log-search", async (req, res) => {
  try {
    await service.logSearch(req.body);
    res.status(200).send("Logged");
  } catch (err) {
    // Non-blocking
    res.status(200).send("Logged with error");
  }
});

export default router;
