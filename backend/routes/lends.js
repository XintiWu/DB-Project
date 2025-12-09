import express from "express";
import * as service from "../services/lends.js";

const router = express.Router();

// Get lends by user ID
router.get("/user/:user_id", async (req, res) => {
    try {
        const result = await service.getLendsByUserId({ user_id: req.params.user_id });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
  try {
    if (req.query.user_id) {
        const result = await service.getLendsByUserId({ user_id: req.query.user_id });
        return res.json(result);
    }
    if (req.query.outstanding) {
        const result = await service.getOutstandingLends();
        return res.json(result);
    }
    const result = await service.getAllLends();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lends by inventory ID (for warehouse owner)
router.get("/inventory/:id", async (req, res) => {
    try {
      const result = await service.getLendsByInventoryId(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.post("/", async (req, res) => {
  try {
    const result = await service.createLend(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/approve", async (req, res) => {
    try {
      const result = await service.approveLend({ lend_id: req.params.id });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.put("/:id/reject", async (req, res) => {
    try {
      const result = await service.rejectLend({ lend_id: req.params.id });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Return item (Update returned_at)
router.put("/:id/return", async (req, res) => {
  try {
    const result = await service.returnLend({ lend_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/return-item", async (req, res) => {
    try {
        const result = await service.returnLendByItem(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generic update? Service missing generic update.
// Assuming only return is supported or add generic update if needed.
// Base controller had generic update.
// Let's assume return is the main update action.

export default router;
