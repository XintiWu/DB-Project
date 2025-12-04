import express from "express";
import * as service from "../services/skill_tags.js";

const router = express.Router();

// Get All Skill Tags
router.get("/", async (req, res) => {
  try {
    const result = await service.getAllSkillTags();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
