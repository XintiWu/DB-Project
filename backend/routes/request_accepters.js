import express from "express";
import * as service from "../services/request_accepters.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (req.query.request_id) {
        const result = await service.getAcceptersByRequestId({ request_id: req.query.request_id });
        return res.json(result);
    }
    if (req.query.accepter_id) {
        const result = await service.getAcceptedRequestsByUserId({ accepter_id: req.query.accepter_id });
        return res.json(result);
    }
    const result = await service.getAllRequestAccepters();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createRequestAccepter(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (Cancel acceptance) - Composite key or use query params?
// Service expects { request_id, accepter_id }
// Let's use DELETE /:request_id/:accepter_id
router.delete("/:request_id/:accepter_id", async (req, res) => {
  try {
    const result = await service.deleteRequestAccepter({ 
        request_id: req.params.request_id,
        accepter_id: req.params.accepter_id
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
