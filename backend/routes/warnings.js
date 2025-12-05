import express from "express";
import * as service from "../services/warnings.js";

const router = express.Router();

// Create a warning (Admin only - middleware to be added later or checked in service/controller)
router.post("/", async (req, res) => {
  try {
    const result = await service.createWarning(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get warnings for a user
router.get("/user/:id", async (req, res) => {
  try {
    const result = await service.getWarningsByUserId(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
