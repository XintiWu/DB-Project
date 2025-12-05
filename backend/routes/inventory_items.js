import express from "express";
import * as service from "../services/inventory_items.js";

const router = express.Router();

// Get items (filter by inventory_id or category_id)
router.get("/", async (req, res) => {
  try {
    if (req.query.inventory_id && req.query.category_id) {
        const result = await service.searchInventoryItemsByCategory({ 
            inventory_id: req.query.inventory_id,
            category_id: req.query.category_id 
        });
        return res.json(result);
    }
    
    if (req.query.inventory_id) {
        const result = await service.getInventoryItemsByInventoryId(req.query.inventory_id);
        return res.json(result);
    }

    res.status(501).json({ error: "Please provide inventory_id" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to inventory
router.post("/", async (req, res) => {
  try {
    const result = await service.addInventoryItem(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item in inventory (Composite key)
router.put("/:inventory_id/:item_id", async (req, res) => {
  try {
    const data = { 
        ...req.body, 
        inventory_id: req.params.inventory_id,
        item_id: req.params.item_id
    };
    const result = await service.updateInventoryItem(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item from inventory (Composite key)
router.delete("/:inventory_id/:item_id", async (req, res) => {
  try {
    const result = await service.deleteInventoryItem({ 
        inventory_id: req.params.inventory_id,
        item_id: req.params.item_id
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
