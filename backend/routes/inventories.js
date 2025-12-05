import express from "express";
import * as service from "../services/inventories.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await service.getAllInventories();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await service.searchInventoryByInventoryId({ inventory_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createInventory(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/transfer", async (req, res) => {
  console.log('[Route] POST /inventories/transfer hit', req.body);
  try {
    const result = await service.transferInventory(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, inventory_id: req.params.id };
    const result = await service.updateInventoryInfo(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteInventory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
