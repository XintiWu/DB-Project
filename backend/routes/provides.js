import express from "express";
import * as service from "../services/provides.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (req.query.user_id) {
        const result = await service.getProvidesByUserId({ user_id: req.query.user_id });
        return res.json(result);
    }
    const result = await service.getAllProvides();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createProvide(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteProvide({ provide_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
