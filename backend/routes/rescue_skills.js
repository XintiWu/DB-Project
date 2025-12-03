import express from "express";
import * as service from "../services/rescue_skills.js";

const router = express.Router();

// Get by request_id
router.get("/", async (req, res) => {
  try {
    if (req.query.request_id) {
        const result = await service.getRescueSkills({ request_id: req.query.request_id });
        return res.json(result);
    }
    res.status(501).json({ error: "Please provide request_id" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await service.addRescueSkill(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (Composite key)
router.delete("/:request_id/:skill_tag", async (req, res) => {
  try {
    const result = await service.removeRescueSkill({ 
        request_id: req.params.request_id,
        skill_tag: req.params.skill_tag
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
