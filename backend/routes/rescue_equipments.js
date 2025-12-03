import express from "express";
import * as service from "../services/rescue_equipments.js";

const router = express.Router();

// Get by request_id
router.get("/", async (req, res) => {
  try {
    if (req.query.request_id) {
        const result = await service.getRescueEquipments({ request_id: req.query.request_id });
        return res.json(result);
    }
    res.status(501).json({ error: "Please provide request_id" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.addRescueEquipment(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Qty (Composite key)
router.put("/:request_id/:required_equipment", async (req, res) => {
  try {
    const data = { 
        ...req.body, 
        request_id: req.params.request_id,
        required_equipment: req.params.required_equipment
    };
    const result = await service.updateRescueEquipmentQty(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (Composite key)
router.delete("/:request_id/:required_equipment", async (req, res) => {
  try {
    const result = await service.removeRescueEquipment({ 
        request_id: req.params.request_id,
        required_equipment: req.params.required_equipment
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
