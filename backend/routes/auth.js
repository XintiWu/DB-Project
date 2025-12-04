import express from "express";
import * as service from "../services/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const result = await service.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
