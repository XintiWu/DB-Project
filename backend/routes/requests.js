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

// Get All (Admin Unverified) or Filtered?
// Base controller was getAll -> SELECT * FROM REQUESTS
// Service has getAllUnverifiedRequests, getRequestsByRequesterId, etc.
// Let's keep a generic getAll if needed, or map to specific service functions?
// For now, let's implement a generic getAll using the pool directly or add getAll to service?
// The service doesn't have a simple "getAll". It has "getAllUnverifiedRequests".
// Let's add "getAllRequests" to service or just use pool here? 
// Better to add to service to keep consistency.
// But for now, I will map to what exists. 
// If I replace the whole file, I lose the generic getAll.
// Let's assume the user wants the complex logic.
// I will add a getAllRequests to the service in a separate step if needed.
// For now, I'll use getAllUnverifiedRequests for "/" GET? Or maybe just keep generic controller for simple GETs?
// But I can't mix easily if I replace the whole file.
// Let's stick to what the service provides. 
// If the service is missing a generic getAll, I should add it.

// Let's add getAllRequests to service first.
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
             const result = await service.getAllUnverifiedRequests();
             return res.json(result);
        }
        
        // Default to all
        const result = await service.getAllRequests();
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
