import express from "express";
import * as service from "../services/inventory_items.js";

const router = express.Router();

// Get items by inventory_id (supports category_id and status via query)
router.get("/:inventory_id", async (req, res) => {
  try {
    if (req.query.category_id) {
       const result = await service.searchInventoryItemsByCategory({
           inventory_id: req.params.inventory_id,
           category_id: req.query.category_id
       });
       res.json(result);
    } else {
       const status = req.query.status;
       const result = await service.getInventoryItemsByInventoryId(req.params.inventory_id, status);
       res.json(result);
    }
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
    const result = await service.deleteInventoryItem(
        req.params.inventory_id,
        req.params.item_id,
        req.query.status || 'Owned'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
