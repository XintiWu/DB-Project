import express from "express";
import * as service from "../services/incidents.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Support filtering
    if (req.query.area_id) {
        const result = await service.searchIncidentsByAreaId({ area_id: req.query.area_id });
        return res.json(result);
    }
    if (req.query.reporter_id) {
        const result = await service.searchIncidentsByReporterId({ reporter_id: req.query.reporter_id });
        return res.json(result);
    }

    const result = await service.getAllIncidents();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await service.getIncidentById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createIncident(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, id: req.params.id };
    const result = await service.updateIncident(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteIncident(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
