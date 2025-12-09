import express from "express";
import * as service from "../services/requests.js";

const router = express.Router();

// Create Request (Complex transaction)
router.post("/", async (req, res) => {
  try {
    const result = await service.createRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Request Info
router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, request_id: req.params.id };
    const result = await service.updateRequestInfo(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// getAllRequests
router.get("/", async (req, res) => {
    try {
        // If query params exist, maybe filter?
        if (req.query.requester_id) {
            const result = await service.getRequestsByRequesterId({ requester_id: req.query.requester_id });
            return res.json(result);
        }
        if (req.query.incident_id) {
            const result = await service.getRequestsByIncidentId({ incident_id: req.query.incident_id });
            return res.json(result);
        }
        if (req.query.unverified) {
             const page = parseInt(req.query.page) || 1;
             const limit = parseInt(req.query.limit) || 10;
             const result = await service.getAllUnverifiedRequests({ page, limit });
             return res.json(result);
        }
        
        // Default to all (supports incident_id)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { type, keyword, incident_id, area_name, area_id } = req.query;
        const result = await service.getAllRequests({ page, limit, type, keyword, incident_id, area_name, area_id });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await service.getRequestById({ request_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteRequest({ request_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Review
router.put("/:id/review", async (req, res) => {
    try {
        const data = { ...req.body, request_id: req.params.id };
        const result = await service.reviewRequest(data);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
