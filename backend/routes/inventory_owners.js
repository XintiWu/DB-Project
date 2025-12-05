import express from "express";
import * as service from "../services/inventory_owners.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (req.query.inventory_id) {
        const result = await service.getOwnersByInventoryId({ inventory_id: req.query.inventory_id });
        return res.json(result);
    }
    if (req.query.user_id) {
        console.log('[API] Get Inventories for User ID:', req.query.user_id);
        const result = await service.getInventoriesByUserId({ user_id: req.query.user_id });
        console.log('[API] Inventories found:', result.length);
        return res.json(result);
    }
    const result = await service.getAllInventoryOwners();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.addInventoryOwner(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:inventory_id/:user_id", async (req, res) => {
  try {
    const result = await service.removeInventoryOwner({ 
        inventory_id: req.params.inventory_id,
        user_id: req.params.user_id
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
