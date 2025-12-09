import express from "express";
import * as service from "../services/shelters.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // 查詢附近避難所（依地理位置）
    if (req.query.latitude && req.query.longitude) {
      const latitude = parseFloat(req.query.latitude);
      const longitude = parseFloat(req.query.longitude);
      const limit = parseInt(req.query.limit) || 10;
      const result = await service.searchNearbyShelters({ latitude, longitude, limit });
      return res.json(result);
    }
    
    if (req.query.area_id) {
        const result = await service.searchSheltersByAreaId({ area_id: req.query.area_id });
        return res.json(result);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { keyword } = req.query;
    const result = await service.getAllShelters({ page, limit, keyword });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await service.searchShelterById({ shelter_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createShelter(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, shelter_id: req.params.id };
    const result = await service.updateShelter(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteShelter({ shelter_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
