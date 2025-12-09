import express from "express";
import * as service from "../services/items.js";

const router = express.Router();

// Create Item (Complex transaction)
router.post("/", async (req, res) => {
  try {
    const result = await service.createItem(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Item
router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, item_id: req.params.id };
    const result = await service.updateItem(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get One
router.get("/:id", async (req, res) => {
  try {
    const result = await service.searchItemByItemId({ item_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteItem({ item_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All? Service missing getAllItems.
// I'll add it to service.
router.get("/", async (req, res) => {
    try {
        if (req.query.keyword) {
             const result = await service.searchItemsByName(req.query.keyword);
             return res.json(result);
        }
        const result = await service.getAllItems();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
