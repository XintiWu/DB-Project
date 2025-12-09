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

// Bulk accept requests (for claim functionality) - MUST be before other POST routes
router.post("/bulk", async (req, res) => {
  try {
    console.log('=== Bulk Accept Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Items count:', req.body?.items?.length);
    
    const result = await service.bulkAcceptRequests(req.body);
    
    console.log('Bulk accept result:', JSON.stringify(result, null, 2));
    res.status(201).json(result);
  } catch (err) {
    console.error('Bulk accept error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: err.message,
      details: err.stack 
    });
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
