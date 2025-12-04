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

export default router;
