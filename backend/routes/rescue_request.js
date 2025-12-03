import express from "express";
import * as service from "../services/rescue_requests.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const result = await service.getRescueDetails({ request_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, request_id: req.params.id };
    const result = await service.updateRescueHeadcount(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
