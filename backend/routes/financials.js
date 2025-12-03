import express from "express";
import * as service from "../services/financials.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (req.query.admin_id) {
        const result = await service.getTransactionsByAdminId({ admin_id: req.query.admin_id });
        return res.json(result);
    }
    const result = await service.getAllTransactions();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await service.getTransactionById({ txn_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.createTransaction(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body, txn_id: req.params.id };
    const result = await service.updateTransaction(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteTransaction({ txn_id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
